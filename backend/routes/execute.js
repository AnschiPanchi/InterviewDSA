import express from 'express';
import axios from 'axios';

const router = express.Router();

const PISTON_API = 'https://emkc.org/api/v2/piston/execute';

const VERSIONS = {
    javascript: '18.15.0',
    python: '3.10.0',
    cpp: '10.2.0',
    java: '15.0.2',
    'c++': '10.2.0'
};

const generateRunnerCode = (userCode, language, testCases) => {
    if (language === 'javascript') {
        const tests = testCases.map(tc => {
            return `
try {
    const result = solve(${tc.input});
    let expected = ${tc.expectedOutput};
    console.log(JSON.stringify({ 
        status: JSON.stringify(result) === JSON.stringify(expected) ? 'Pass' : 'Fail', 
        actual: result, 
        expected: expected 
    }));
} catch(e) {
    console.log(JSON.stringify({ status: 'Error', error: e.message, expected: ${tc.expectedOutput} }));
}`;
        }).join('\n');

        return `${userCode}\n\nconsole.log("___TEST_RESULTS___");\n${tests}`;
    }

    if (language === 'python') {
        const tests = testCases.map(tc => {
            return `
try:
    res = solve(${JSON.stringify(tc.input)})
    import json
    expected = ${JSON.stringify(tc.expectedOutput)}
    print(json.dumps({"status": "Pass" if res == expected else "Fail", "actual": res, "expected": expected}))
except Exception as e:
    import json
    print(json.dumps({"status": "Error", "error": str(e), "expected": ${JSON.stringify(tc.expectedOutput)}}))`;
        }).join('\n');
        return `${userCode}\nprint("___TEST_RESULTS___")\n${tests}`;
    }

    if (language === 'cpp' || language === 'c++') {
        const tests = testCases.map(tc => {
            const inStr = JSON.stringify(JSON.stringify(tc.input));
            const outStr = JSON.stringify(tc.expectedOutput);
            return `
    try {
        std::string expected = ${JSON.stringify(outStr)};
        std::string actual = sol.solve(${inStr});
        std::string actualEscaped = "";
        for(char c : actual) {
            if(c == '"') actualEscaped += "\\\\\\"";
            else if(c == '\\\\') actualEscaped += "\\\\\\\\";
            else actualEscaped += c;
        }
        std::cout << "{\\"status\\": \\"" << (actual == expected ? "Pass" : "Fail") 
                  << "\\", \\"actual\\": \\"" << actualEscaped 
                  << "\\", \\"expected\\": " << expected << "}\\n";
    } catch(const std::exception& e) {
        std::cout << "{\\"status\\": \\"Error\\", \\"error\\": \\"" << e.what() << "\\", \\"expected\\": " << expected << "}\\n";
    }`;
        }).join('\n');

        return `#include <iostream>\n#include <string>\n#include <vector>\n#include <map>\n#include <algorithm>\n\nusing namespace std;\n\n${userCode}\n\nint main() {\n    Solution sol;\n    std::cout << "___TEST_RESULTS___\\n";\n${tests}\n    return 0;\n}`;
    }

    if (language === 'java') {
        const tests = testCases.map(tc => {
            const inStr = JSON.stringify(JSON.stringify(tc.input));
            const outStr = JSON.stringify(tc.expectedOutput);
            return `
        try {
            String expected = ${JSON.stringify(outStr)};
            String actual = String.valueOf(sol.solve(${inStr}));
            String actualEscaped = actual.replace("\\\\", "\\\\\\\\").replace("\"", "\\\\\"");
            System.out.println("{\\"status\\": \\"" + (actual.equals(expected) ? "Pass" : "Fail") + "\\", \\"actual\\": \\"" + actualEscaped + "\\", \\"expected\\": " + expected + "}");
        } catch(Exception e) {
            System.out.println("{\\"status\\": \\"Error\\", \\"error\\": \\"" + e.getMessage() + "\\", \\"expected\\": " + expected + "}");
        }`;
        }).join('\n');

        return `import java.util.*;\n\n${userCode}\n\npublic class Main {\n    public static void main(String[] args) {\n        Solution sol = new Solution();\n        System.out.println("___TEST_RESULTS___");\n${tests}\n    }\n}`;
    }

    return userCode;
};

router.post('/', async (req, res) => {
    try {
        const { code, language, testCases } = req.body;

        if (!['javascript', 'python', 'cpp', 'c++', 'java'].includes(language)) {
            return res.status(400).json({ error: `Code execution for ${language} is not supported yet.` });
        }

        if (!testCases || testCases.length === 0) {
            return res.status(400).json({ error: `No test cases provided.` });
        }

        const runnerCode = generateRunnerCode(code, language, testCases);

        const langName = language === 'cpp' ? 'c++' : language;

        const response = await axios.post(PISTON_API, {
            language: langName,
            version: VERSIONS[langName],
            files: [{ content: runnerCode }]
        });

        const { run, compile } = response.data;

        if (compile && compile.code !== 0) {
            return res.status(400).json({ error: compile.output });
        }

        // Output parsing
        const output = run.output;
        if (!output.includes('___TEST_RESULTS___')) {
            return res.status(400).json({ error: output || 'Program terminated unexpectedly.' });
        }

        const outputParts = output.split('___TEST_RESULTS___');
        const userStdout = outputParts[0].trim();
        const testOutputs = outputParts[1] ? outputParts[1].trim().split('\n').filter(Boolean) : [];

        const results = testOutputs.map((out, i) => {
            try {
                const parsed = JSON.parse(out);
                return { input: testCases[i].input, ...parsed };
            } catch (e) {
                return { input: testCases[i].input, status: 'Error', error: 'Failed to run test', raw: out, expected: testCases[i].expectedOutput };
            }
        });

        res.json({ stdout: userStdout, results });

    } catch (error) {
        console.error("Execution error:", error);
        res.status(500).json({ error: "Failed to execute code" });
    }
});

export default router;
