import express from 'express';
import OpenAI from 'openai';
import Attempt from '../models/Attempt.js';
import User from '../models/User.js';
import verifyToken from '../middleware/auth.js';
import { checkAchievements } from '../utils/achievementEngine.js';

const router = express.Router();

// Helper to get AI instance safely when the route is called
// It checks for Groq first, then OpenAI fallback.
const getAi = () => {
    if (process.env.GROQ_API_KEY) {
        return new OpenAI({
            apiKey: process.env.GROQ_API_KEY,
            baseURL: "https://api.groq.com/openai/v1",
        });
    } else if (process.env.OPENAI_API_KEY) {
        return new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    return null;
};

const getModel = () => {
    // We default to llama 3.3 for Groq and gpt-4o-mini for OpenAI to ensure speed and low cost
    return process.env.GROQ_API_KEY ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini';
};

// Helper to safely parse JSON from AI response, stripping markdown formatting if present
const parseJSONResponse = (text) => {
    try {
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (e) {
        throw new Error(`Failed to parse AI response as JSON: ${e.message}`);
    }
};

router.post('/generate-question', async (req, res) => {
    try {
        const ai = getAi();
        if (!ai) return res.status(503).json({ error: "AI API key not configured on server. Add GROQ_API_KEY or OPENAI_API_KEY to backend/.env" });
        const { topic, difficulty, solvedQuestions = [] } = req.body;

        const avoidanceRule = solvedQuestions.length > 0
            ? `\nCRITICAL: DO NOT GENERATE ANY OF THE FOLLOWING QUESTIONS THAT THE CANDIDATE HAS ALREADY SOLVED:\n${solvedQuestions.map(q => `- ${q}`).join('\n')}\n`
            : '';

        const prompt = `You are an expert technical interviewer. Generate a unique Data Structures and Algorithms (DSA) question.
Topic: ${topic || 'General'}
Difficulty: ${difficulty || 'Medium'}
${avoidanceRule}

CRITICAL INSTRUCTIONS FOR TEST CASES:
1. "testCases" MUST contain 3-5 valid test cases.
2. Each test case MUST have "input" and "expectedOutput".
3. "input" should be the exact arguments to pass to the solve function (e.g., "[1, 2, 3]" for an array, "5" for a number, "\\"abc\\"" for a string).
4. "starterCode" MUST use a class named "Solution" with a method named "solve" for Java and C++.
5. Java "solve" should be public. C++ "solve" should be public.

Provide the response in the following JSON format ONLY:
{
  "title": "Question Title",
  "description": "Clear problem description...",
  "examples": [
    { "input": "...", "output": "...", "explanation": "..." }
  ],
  "constraints": ["constraint 1", "constraint 2"],
  "testCases": [
    { "input": "[1, 2, 3]", "expectedOutput": "6" },
    { "input": "[0, 0, 0]", "expectedOutput": "0" }
  ],
  "starterCode": {
    "javascript": "function solve(arr) {\\n  // your code here\\n}",
    "python": "def solve(arr):\\n    # your code here\\n    pass",
    "java": "public class Solution {\\n    public int solve(int[] arr) {\\n        // your code here\\n        return 0;\\n    }\\n}",
    "cpp": "class Solution {\\npublic:\\n    int solve(vector<int>& arr) {\\n        // your code here\\n        return 0;\\n    }\\n};"
  }
}`;

        const response = await ai.chat.completions.create({
            model: getModel(),
            messages: [{ role: "system", content: prompt }],
            response_format: { type: "json_object" }
        });

        let questionData = parseJSONResponse(response.choices[0].message.content);
        res.json(questionData);
    } catch (error) {
        console.error("Error generating question:", error);
        res.status(500).json({ error: "Failed to generate question: " + error.message, stack: error.stack });
    }
});

router.post('/review', verifyToken, async (req, res) => {
    try {
        const ai = getAi();
        if (!ai) return res.status(503).json({ error: "AI API key not configured on server" });
        const { question, language, code, approach } = req.body;

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const prompt = `You are a supportive but rigorous technical interviewer. 
Review the following user submission for a DSA problem.

Problem: 
${JSON.stringify(question)}

Language Use: ${language || 'Unknown'}

User's Code:
${code || 'No code provided.'}

User's Approach/Explanation:
${approach || 'No explanation provided.'}

Provide your feedback in the following JSON format ONLY:
{
  "score": 85, // out of 100
  "feedback": "Overall impression...",
  "strengths": ["...", "..."],
  "areasForImprovement": ["...", "..."],
  "timeComplexity": "O(N) - explain why",
  "spaceComplexity": "O(1) - explain why"
}`;

        const response = await ai.chat.completions.create({
            model: getModel(),
            messages: [{ role: "system", content: prompt }],
            response_format: { type: "json_object" }
        });

        let reviewData = parseJSONResponse(response.choices[0].message.content);

        // Persistent persistence: Save the interview attempt
        const attempt = new Attempt({
            userId: req.userId,
            topic: question.topic || "General",
            difficulty: question.difficulty || "Medium",
            question: question.title,
            code: code,
            score: reviewData.score,
            feedbackSummary: reviewData.feedback,
            strengths: reviewData.strengths,
            areasForImprovement: reviewData.areasForImprovement
        });
        await attempt.save();

        // Check achievements: Specifically count total interviews
        const interviewCount = await Attempt.countDocuments({ userId: req.userId });
        const earned = await checkAchievements(user, { interviewsCount: interviewCount });

        res.json({ ...reviewData, earnedAchievements: earned });
    } catch (error) {
        console.error("Error reviewing submission:", error);
        res.status(500).json({ error: "Failed to review submission: " + error.message, stack: error.stack });
    }
});


router.post('/hint', async (req, res) => {
    try {
        const ai = getAi();
        if (!ai) return res.status(503).json({ error: 'AI API key not configured' });
        const { question, hintsAlreadyGiven = [] } = req.body;

        const previousHints = hintsAlreadyGiven.length > 0
            ? `Previous hints already given:\n${hintsAlreadyGiven.map((h, i) => `${i + 1}. ${h}`).join('\n')}\n\nGive a DIFFERENT, more specific hint.`
            : '';

        const prompt = `You are a Socratic coding mentor helping someone solve a DSA problem WITHOUT giving away the answer.

Problem: ${question.title}
Description: ${question.description}

${previousHints}

Give ONE short but useful hint (2-3 sentences max). 
- Guide their THINKING (e.g. "Consider what data structure allows O(1) lookups")
- Do NOT write any code
- Do NOT reveal the algorithm or solution directly
- Be encouraging

Respond in JSON: { "hint": "your hint here" }`;

        const response = await ai.chat.completions.create({
            model: getModel(),
            messages: [{ role: "system", content: prompt }],
            response_format: { type: "json_object" }
        });

        let hintData = parseJSONResponse(response.choices[0].message.content);
        res.json({ hint: hintData.hint });
    } catch (error) {
        console.error('Error generating hint:', error);
        res.status(500).json({ error: 'Failed to generate hint: ' + error.message, stack: error.stack });
    }
});


router.post('/chat', async (req, res) => {
    try {
        const ai = getAi();
        if (!ai) return res.status(503).json({ error: 'AI API key not configured' });
        const { question, message, history = [] } = req.body;

        const systemPrompt = `You are a supportive AI coding mentor helping a student during a mock interview.
The student is solving this problem:
Title: ${question?.title || 'Unknown'}
Description: ${question?.description || ''}

Rules:
- Guide their thinking WITHOUT giving away the full solution or writing code for them
- You CAN explain concepts, time/space complexity, and point them in the right direction
- Be encouraging, concise (2-4 sentences), and conversational
- If asked directly for the answer, redirect them to think about it themselves`;

        const messages = [
            { role: "system", content: systemPrompt },
            ...history.map(h => ({
                role: h.role === 'user' ? 'user' : 'assistant',
                content: h.content
            })),
            { role: "user", content: message }
        ];

        const response = await ai.chat.completions.create({
            model: getModel(),
            messages,
        });

        res.json({ reply: response.choices[0].message.content.trim() });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Failed to get AI response' });
    }
});

router.post('/recommend-topic', verifyToken, async (req, res) => {
    try {
        const ai = getAi();
        if (!ai) return res.status(503).json({ error: "AI API key not configured on server" });
        const { skills, targetJob } = req.body;
        const userId = req.userId;

        // Fetch user attempts to find weak topics
        let weakTopicsContext = "";
        try {
            if (userId) {
                const attempts = await Attempt.find({ userId: userId });
                if (attempts.length > 0) {
                    const topicMap = {};
                    attempts.forEach(a => {
                        if (!a.topic) return;
                        if (!topicMap[a.topic]) topicMap[a.topic] = { total: 0, count: 0 };
                        topicMap[a.topic].total += a.score;
                        topicMap[a.topic].count++;
                    });
                    
                    const topicBreakdown = Object.entries(topicMap)
                        .map(([topic, { total, count }]) => ({ topic, avg: Math.round(total / count) }))
                        .sort((a, b) => a.avg - b.avg); // Sort ascending (weakest first)
                    
                    const weakTopics = topicBreakdown.filter(t => t.avg < 70).slice(0, 3).map(t => `${t.topic} (Avg Score: ${t.avg})`);
                    if (weakTopics.length > 0) {
                        weakTopicsContext = `\nCRITICAL CONTEXT: The candidate has historically struggled with these topics in past interviews: ${weakTopics.join(', ')}. Factor this into your recommendation.`;
                    } else {
                        weakTopicsContext = `\nThe candidate has no drastically weak topics on record, so focus on their tech stack or target job.`;
                    }
                }
            }
        } catch(e) { console.error("Could not fetch attempts for weak topic analysis", e); }

        const skillsContext = (skills && skills.length > 0) 
            ? `The candidate has the following skills/tech stack: ${skills.join(', ')}.`
            : `The candidate has not provided specific technical skills yet.`;
            
        const jobContext = targetJob
            ? `\nThe candidate's ultimate career goal is: "${targetJob}".`
            : "";

        const prompt = `You are an expert technical interviewer and career coach.
${skillsContext}${jobContext}${weakTopicsContext}

Based on this complete profile (skills, weak mock interview topics, and target job), recommend ONE highly relevant Data Structures and Algorithms (DSA) topic for them to practice next to improve their interview readiness.

Provide the response in the following JSON format ONLY, without any markdown formatting or extra text:
{
  "topic": "The exact name of the topic (e.g., 'Graphs', 'Dynamic Programming', 'Sliding Window', 'Trees')",
  "reason": "A motivational, personalized 1-2 sentence explanation of why this topic is perfect for them based on their specific weak areas, target job, or skillset."
}`;

        const response = await ai.chat.completions.create({
            model: getModel(),
            messages: [{ role: "system", content: prompt }],
            response_format: { type: "json_object" }
        });

        let data = parseJSONResponse(response.choices[0].message.content);
        res.json(data);
    } catch (error) {
        console.error("Error generating topic recommendation:", error);
        res.status(500).json({ error: "Failed to generate recommendation: " + error.message });
    }
});

router.post('/job-skills', verifyToken, async (req, res) => {
    try {
        const ai = getAi();
        if (!ai) return res.status(503).json({ error: "AI API key not configured on server" });
        const { skills, targetJob } = req.body;

        if (!targetJob) return res.status(400).json({ error: "Target job is required to generate a learning path." });

        const skillsContext = (skills && skills.length > 0) 
            ? `Current skills: ${skills.join(', ')}.`
            : `Current skills: None provided.`;

        const prompt = `You are an expert technical career counselor.
Target Job: ${targetJob}
${skillsContext}

Analyze what crucial technical skills or technologies the candidate is missing to successfully land their Target Job.
Identify the top 3-5 concrete technical skills they need to learn. 

Provide the response in the following JSON format ONLY, without any markdown formatting or extra text:
{
  "verdict": "A 1-2 sentence summary of their current standing towards this job and an encouraging word.",
  "missingSkills": [
    {
      "skill": "Name of the technology/skill",
      "reason": "A concise, 1-sentence explanation of why this is required for the target job."
    }
  ]
}`;

        const response = await ai.chat.completions.create({
            model: getModel(),
            messages: [{ role: "system", content: prompt }],
            response_format: { type: "json_object" }
        });

        let data = parseJSONResponse(response.choices[0].message.content);
        res.json(data);
    } catch (error) {
        console.error("Error generating skill gap:", error);
        res.status(500).json({ error: "Failed to generate skill gap analysis: " + error.message });
    }
});

router.post('/study-guide', async (req, res) => {
    try {
        const ai = getAi();
        if (!ai) return res.status(503).json({ error: "AI API key not configured on server" });
        const { topic } = req.body;

        const prompt = `You are an expert technical coach. Create a comprehensive, concise study guide for the topic: "${topic}".
        Include:
        1. A "cheatSheet" (3-5 key concepts with brief explanations).
        2. "interviewQuestions" (3 common conceptual questions and short answers).
        3. A "microChallenge" (A 5-10 line code snippet with a logical BUG that the user must find/fix. Provide "snippet", "hint", and "solution").

        Provide the response in the following JSON format ONLY:
        {
          "topic": "${topic}",
          "cheatSheet": [
            { "concept": "...", "explanation": "..." }
          ],
          "interviewQuestions": [
            { "question": "...", "answer": "..." }
          ],
          "microChallenge": {
            "snippet": "...",
            "hint": "...",
            "solution": "..."
          }
        }`;

        const response = await ai.chat.completions.create({
            model: getModel(),
            messages: [{ role: "system", content: prompt }],
            response_format: { type: "json_object" }
        });

        let data = parseJSONResponse(response.choices[0].message.content);
        res.json(data);
    } catch (error) {
        console.error("Error generating study guide:", error);
        res.status(500).json({ error: "Failed to generate study guide: " + error.message });
    }
});

export default router;
