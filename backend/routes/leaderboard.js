import express from 'express';
import Attempt from '../models/Attempt.js';
import optionalAuth from '../middleware/optionalAuth.js';

const router = express.Router();

// GET /api/leaderboard — top 20 users by average score (min 1 attempt)
router.get('/', optionalAuth, async (req, res) => {
    try {
        const leaderboard = await Attempt.aggregate([
            {
                $group: {
                    _id: '$userId',
                    avgScore: { $avg: '$score' },
                    totalAttempts: { $sum: 1 },
                    bestScore: { $max: '$score' },
                    totalTime: { $sum: '$timeSpent' },
                }
            },
            { $match: { totalAttempts: { $gte: 1 } } },
            { $sort: { avgScore: -1 } },
            { $limit: 20 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    username: '$user.username',
                    avgScore: { $round: ['$avgScore', 1] },
                    bestScore: 1,
                    totalAttempts: 1,
                    totalTime: 1,
                    duelWins: { $ifNull: ['$user.duelWins', 0] },
                }
            }
        ]);

        // Add rank + flag current user
        const currentUserId = req.userId ? String(req.userId) : null;
        const ranked = leaderboard.map((entry, i) => ({
            ...entry,
            rank: i + 1,
            isCurrentUser: currentUserId && String(entry._id) === currentUserId,
        }));

        res.json(ranked);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

export default router;
