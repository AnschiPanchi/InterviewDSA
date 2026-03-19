import express from 'express';
import User from '../models/User.js';
import verifyToken from '../middleware/auth.js';
import multer from 'multer';
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const router = express.Router();

// multer setup — memory storage so we can read the buffer
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/onboarding/parse-resume
// Parse a PDF resume and return extracted skills (uses pdf-parse)
router.post('/parse-resume', verifyToken, upload.single('resume'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    try {
        const parsed = await pdfParse(req.file.buffer);
        const text = parsed.text.toLowerCase();

        // Comprehensive keyword-based skill extraction
        const SKILL_KEYWORDS = [
            'javascript', 'typescript', 'python', 'java', 'c\\+\\+', 'c#', 'ruby', 'php', 'go', 'rust', 'kotlin', 'swift', 'dart', 'scala',
            'react', 'vue', 'angular', 'next.js', 'nuxt.js', 'node.js', 'express', 'django', 'flask', 'spring boot', 'laravel', 'fastapi',
            'mongodb', 'postgresql', 'mysql', 'sql', 'redis', 'elasticsearch', 'cassandra', 'dynamodb', 'sqlite', 'oracle',
            'docker', 'kubernetes', 'aws', 'gcp', 'google cloud', 'azure', 'terraform', 'ansible', 'jenkins', 'github actions',
            'data structures', 'algorithms', 'dsa', 'dynamic programming', 'recursion', 'machine learning', 'deep learning',
            'nlp', 'computer vision', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'opencv',
            'git', 'github', 'bitbucket', 'jira', 'confluence', 'rest api', 'graphql', 'grpc', 'websocket',
            'microservices', 'system design', 'distributed systems', 'unit testing', 'jest', 'cypress', 'selenium',
            'agile', 'scrum', 'devops', 'ci/cd', 'linux', 'bash', 'powershell', 'web assembly', 'pwa',
            'tailwind css', 'sass', 'less', 'bootstrap', 'material ui', 'redux', 'mobx', 'graphql', 'apollo',
            'firebase', 'supabase', 'netlify', 'vercel', 'heroku'
        ];

        const found = SKILL_KEYWORDS
            .filter(skill => {
                // Use regex with word boundaries to avoid false positives (e.g. "Go" inside "Google")
                const regex = new RegExp(`\\b${skill}\\b`, 'i');
                return regex.test(text);
            })
            .map(s => s.replace(/\\/g, '').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));

        res.json({ skills: [...new Set(found)] });
    } catch (err) {
        console.error('PDF parse error:', err);
        res.status(500).json({ error: 'Failed to parse PDF' });
    }
});

// POST /api/onboarding/save
// Save target role and weak topics, mark forge as complete
router.post('/save', verifyToken, async (req, res) => {
    const { targetRole, weakTopics, skills } = req.body;
    try {
        const update = {
            forgeComplete: true,
            weakTopics: weakTopics || [],
        };
        if (targetRole) update.targetJob = targetRole;
        if (skills && skills.length) update.skills = skills;

        const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select('-password');
        res.json({ success: true, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save onboarding' });
    }
});

// GET /api/onboarding/status
// Check if forgeComplete, return user skills + weakTopics
router.get('/status', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('forgeComplete weakTopics skills targetJob');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch onboarding status' });
    }
});

export default router;
