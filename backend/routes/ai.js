import express from 'express';
import OpenAI from 'openai';

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
Provide the response in the following JSON format ONLY, without any markdown formatting or extra text:
{
  "title": "Question Title",
  "description": "Clear problem description...",
  "examples": [
    { "input": "...", "output": "...", "explanation": "..." }
  ],
  "constraints": ["constraint 1", "constraint 2"],
  "testCases": [
    { "input": "...", "expectedOutput": "..." },
    { "input": "...", "expectedOutput": "..." },
    { "input": "...", "expectedOutput": "..." }
  ],
  "starterCode": {
    "javascript": "function solve(args) {\\n  // your code here\\n}",
    "python": "def solve(args):\\n    # your code here\\n    pass",
    "java": "class Solution {\\n    public String solve(String args) {\\n        // your code here\\n        return \\"\\";\\n    }\\n}",
    "cpp": "class Solution {\\npublic:\\n    string solve(string args) {\\n        // your code here\\n        return \\"\\";\\n    }\\n};"
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

router.post('/review', async (req, res) => {
    try {
        const ai = getAi();
        if (!ai) return res.status(503).json({ error: "AI API key not configured on server" });
        const { question, language, code, approach } = req.body;

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
        res.json(reviewData);
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

export default router;
