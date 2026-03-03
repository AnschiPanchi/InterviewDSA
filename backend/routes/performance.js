import express from 'express';
import Attempt from '../models/Attempt.js';
import verifyToken from '../middleware/auth.js';

const router = express.Router();

// POST /api/performance/save
router.post('/save', verifyToken, async (req, res) => {
    const { topic, difficulty, questionTitle, code, timeSpent, score, feedbackSummary, strengths, areasForImprovement } = req.body;

    try {
        const attempt = new Attempt({
            userId: req.userId,
            topic,
            difficulty,
            question: questionTitle,
            code,
            timeSpent,
            score,
            feedbackSummary,
            strengths: strengths || [],
            areasForImprovement: areasForImprovement || []
        });
        await attempt.save();
        res.json({ success: true, attemptId: attempt._id });
    } catch (err) {
        console.error('Error saving attempt:', err);
        res.status(500).json({ error: 'Failed to save attempt' });
    }
});

// GET /api/performance/trends
router.get('/trends', verifyToken, async (req, res) => {
    try {
        const attempts = await Attempt.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(attempts);
    } catch (err) {
        console.error('Error fetching trends:', err);
        res.status(500).json({ error: 'Failed to fetch trends' });
    }
});

export default router;
