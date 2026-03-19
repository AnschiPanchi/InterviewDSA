import express from 'express';
import verifyToken from '../middleware/auth.js';
import User from '../models/User.js';
import { getAllAvailableBadges } from '../utils/achievementEngine.js';

const router = express.Router();

// GET /api/achievements
// Get user's earned achievements vs all available ones
router.get('/', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('achievements');
        const allBadges = getAllAvailableBadges();
        
        const earnedIds = new Set(user.achievements.map(a => a.id));
        
        const formatted = allBadges.map(badge => ({
            ...badge,
            isEarned: earnedIds.has(badge.id),
            earnedAt: user.achievements.find(a => a.id === badge.id)?.earnedAt
        }));

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch achievements' });
    }
});

export default router;
