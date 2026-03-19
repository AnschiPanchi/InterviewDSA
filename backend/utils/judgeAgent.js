import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "", { apiVersion: "v1" });
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * AI Judge Agent
 * Analyzes code submissions for Code Duels.
 */
export const judgeDuel = async (problem, code1, code2, user1, user2) => {
    const prompt = `
    You are an AI Judge for a DSA Code Duel.
    Problem Description: ${JSON.stringify(problem)}

    Player 1 (${user1}):
    Code:
    ${code1}

    Player 2 (${user2}):
    Code:
    ${code2}

    Task:
    1. Check correctness (1-10). IF THE CODE IS JUST RANDOM TEXT, NONSENSE, OR DOES NOT ATTEMPT THE PROBLEM, SCORE 0.
    2. Check efficiency (1-10).
    3. Check readability (1-10).
    4. Provide a winner based on overall quality. A submission that doesn't solve the problem MUST LOSE to one that does.
    5. No Draws for random/empty text vs actual code.

    Format your response AS A RIGID JSON OBJECT:
    {
      "winner": "username",
      "p1": { "correctness": 8, "efficiency": 7, "readability": 9, "feedback": "Brief feedback here" },
      "p2": { "correctness": 9, "efficiency": 8, "readability": 6, "feedback": "Brief feedback here" },
      "explanation": "Summarize WHY the winner won."
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            // Force Draw only if results are truly identical or both 0
            return parsed;
        }
        throw new Error("Invalid AI Response");
    } catch (err) {
        console.error("AI Judging Failed:", err);
        return {
            winner: "Draw (System Failure)",
            explanation: "The AI judge encountered an error. Results split."
        };
    }
};

/**
 * Virtual Execution Engine
 * Simulates code execution using Gemini's logic.
 * Reliable fallback when external APIs are whitelisted/down.
 */
export const virtualExecute = async (language, code, testCases) => {
    const prompt = `
    You are a high-performance code execution engine.
    Language: ${language}
    Code:
    ${code}

    Test Cases: ${JSON.stringify(testCases)}

    Task:
    1. Simulate the execution of this code against the test cases.
    2. If the code is invalid or random text, provide an error in the "stdout" and set result status to "Error".
    3. Provide the STDOUT of the user's code.
    4. For EACH test case, provide: status (Pass/Fail/Error), actual value, expected value.

    Format your response AS A RIGID JSON OBJECT:
    {
      "stdout": "Program output here",
      "results": [
        { "input": "...", "status": "Pass", "actual": "...", "expected": "..." }
      ]
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Invalid AI Execution Response");
    } catch (err) {
        console.error("Virtual Execution Failed:", err);
        throw err;
    }
};
