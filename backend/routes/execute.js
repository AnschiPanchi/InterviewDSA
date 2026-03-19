import express from 'express';
import axios from 'axios';
import { virtualExecute } from '../utils/judgeAgent.js';

const router = express.Router();

const EXECUTION_ENDPOINTS = (process.env.PISTON_API_URLS || 'https://emkc.org/api/v2/piston/execute,https://piston.rs/api/v2/execute')
    .split(',')
    .map(url => url.trim())
    .filter(Boolean);

const shouldUseVirtualFallback = (statusCode) => {
    if (!statusCode) return true;
    return [400, 401, 403, 404, 408, 409, 413, 415, 422, 429, 500, 502, 503, 504].includes(statusCode);
};

const executeWithProvider = async (payload) => {
    let lastError = null;

    for (const endpoint of EXECUTION_ENDPOINTS) {
        try {
            const response = await axios.post(endpoint, payload, { timeout: 15000 });
            return { endpoint, data: response.data };
        } catch (error) {
            lastError = error;
            const statusCode = error?.response?.status;
            if (!shouldUseVirtualFallback(statusCode)) {
                throw error;
            }
            console.warn(`Execution provider failed (${endpoint}): ${statusCode || error.code || error.message}`);
        }
    }

    throw lastError || new Error('No execution providers configured');
};

const VERSIONS = {
    javascript: '18.15.0',
    python: '3.10.0',
    cpp: '10.2.0',
    java: '15.0.2',
};

const generateRunnerCode = (userCode, language, testCases) => {
    if (language === 'javascript') {
        const tests = testCases.map(tc => {
            const input = typeof tc.input === 'string' && (tc.input.startsWith('[') || tc.input.startsWith('{')) ? tc.input : JSON.stringify(tc.input);
            const expected = JSON.stringify(tc.expectedOutput);
            return `
try {
    const result = solve(${input});
    console.log(JSON.stringify({ 
        status: JSON.stringify(result) === ${JSON.stringify(expected)} ? 'Pass' : 'Fail', 
        actual: result, 
        expected: ${expected} 
    }));
} catch(e) {
    console.log(JSON.stringify({ status: 'Error', error: e.message, expected: ${expected} }));
}`;
        }).join('\n');

        return `${userCode}\n\nconsole.log("___TEST_RESULTS___");\n${tests}`;
    }

    if (language === 'python') {
        const tests = testCases.map(tc => {
            const input = typeof tc.input === 'string' && (tc.input.startsWith('[') || tc.input.startsWith('{')) ? tc.input : JSON.stringify(tc.input);
            const expected = JSON.stringify(tc.expectedOutput);
            return `
try:
    import json
    res = solve(${input})
    expected = json.loads(${JSON.stringify(expected)})
    print(json.dumps({"status": "Pass" if res == expected else "Fail", "actual": res, "expected": expected}))
except Exception as e:
    import json
    print(json.dumps({"status": "Error", "error": str(e), "expected": json.loads(${JSON.stringify(expected)})}))`;
        }).join('\n');
        return `${userCode}\nprint("___TEST_RESULTS___")\n${tests}`;
    }

    if (language === 'cpp' || language === 'c++') {
        const tests = testCases.map(tc => {
            const input = typeof tc.input === 'string' ? tc.input : JSON.stringify(tc.input);
            const expected = typeof tc.expectedOutput === 'string' ? tc.expectedOutput : JSON.stringify(tc.expectedOutput);
            return `
    try {
        auto actual = sol.solve(${input});
        auto expected = ${expected};
        std::cout << "{\\"status\\": \\"" << (actual == expected ? "Pass" : "Fail") << "\\", \\"actual\\": \\"" << actual << "\\", \\"expected\\": \\"" << expected << "\\"}\\n";
    } catch(const std::exception& e) {
        std::cout << "{\\"status\\": \\"Error\\", \\"error\\": \\"" << e.what() << "\\", \\"expected\\": \\"${expected}\\"}\\n";
    }`;
        }).join('\n');

        return `#include <iostream>\n#include <string>\n#include <vector>\n#include <map>\n#include <algorithm>\n\nusing namespace std;\n\n${userCode}\n\nint main() {\n    Solution sol;\n    std::cout << "___TEST_RESULTS___\\n";\n${tests}\n    return 0;\n}`;
    }

    if (language === 'java') {
        const tests = testCases.map(tc => {
            const input = typeof tc.input === 'string' ? tc.input : JSON.stringify(tc.input);
            const expected = typeof tc.expectedOutput === 'string' ? tc.expectedOutput : JSON.stringify(tc.expectedOutput);
            return `
        try {
            Object actual = sol.solve(${input});
            Object expected = ${expected};
            System.out.println("{\\"status\\": \\"" + (String.valueOf(actual).equals(String.valueOf(expected)) ? "Pass" : "Fail") + "\\", \\"actual\\": \\"" + String.valueOf(actual) + "\\", \\"expected\\": \\"" + String.valueOf(expected) + "\\"}");
        } catch(Exception e) {
            System.out.println("{\\"status\\": \\"Error\\", \\"error\\": \\"" + e.getMessage() + "\\", \\"expected\\": \\"${expected}\\"}");
        }`;
        }).join('\n');

        return `import java.util.*;\n\n${userCode}\n\npublic class Main {\n    public static void main(String[] args) {\n        Solution sol = new Solution();\n        System.out.println("___TEST_RESULTS___");\n${tests}\n    }\n}`;
    }

    return userCode;
};

router.post('/', async (req, res) => {
    try {
        const { code, language, testCases } = req.body;

        const langKey = (language === 'cpp' || language === 'c++') ? 'cpp' : language;

        if (!VERSIONS[langKey]) {
            return res.status(400).json({ error: `Code execution for ${language} is not supported yet.` });
        }

        if (!testCases || testCases.length === 0) {
            return res.status(400).json({ error: `No test cases provided.` });
        }

        const runnerCode = generateRunnerCode(code, langKey, testCases);
        const pistonLang = langKey === 'cpp' ? 'cpp' : langKey;

        const { data } = await executeWithProvider({
            language: pistonLang,
            version: VERSIONS[langKey],
            files: [{ content: runnerCode }]
        });

        const { run, compile } = data;

        if (compile && compile.code !== 0) {
            return res.status(400).json({ error: compile.output || 'Compilation Error' });
        }

        if (run && run.code !== 0 && !run.output.includes('___TEST_RESULTS___')) {
            return res.status(400).json({ error: run.output || 'Runtime Error' });
        }

        const output = run.output;
        const outputParts = output.split('___TEST_RESULTS___');
        const userStdout = outputParts[0].trim();
        const testOutputs = outputParts[1] ? outputParts[1].trim().split('\n').filter(Boolean) : [];

        const results = testCases.map((tc, i) => {
            const out = testOutputs[i];
            if (!out) return { input: tc.input, status: 'Error', error: 'No output for this test case', expected: tc.expectedOutput };
            try {
                const parsed = JSON.parse(out);
                return { input: tc.input, ...parsed };
            } catch (e) {
                return { input: tc.input, status: 'Error', error: 'Failed to parse test result', raw: out, expected: tc.expectedOutput };
            }
        });

        res.json({ stdout: userStdout, results, executor: 'remote' });

    } catch (error) {
        console.warn('Remote execution failed, trying virtual fallback:', error?.response?.status || error.message);
        try {
            const { code, language, testCases } = req.body;
            console.log('Falling back to Virtual Execution Engine...');
            const virtualResult = await virtualExecute(language, code, testCases);
            res.json({ ...virtualResult, executor: 'virtual' });
        } catch (vErr) {
            console.error("VIRTUAL EXECUTION ERROR:", vErr.message);
            res.status(500).json({ error: "Code execution failed: " + (vErr.message || "Unknown error") });
        }
    }
});

export default router;
