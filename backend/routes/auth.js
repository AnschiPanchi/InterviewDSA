import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import verifyToken from '../middleware/auth.js';

const router = express.Router();

// Helper to calculate & update login streak
const updateStreak = async (user) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let newStreak = user.currentStreak || 0;
    const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;

    if (lastLogin) {
        const lastDay = new Date(lastLogin);
        lastDay.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today - lastDay) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            newStreak += 1;
        } else if (diffDays > 1) {
            newStreak = 1;
        }
        // diffDays === 0 means already logged in today, keep streak as is
    } else {
        newStreak = 1;
    }

    user.currentStreak = newStreak;
    user.lastLogin = new Date();
    await user.save();
    return newStreak;
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    try {
        const existing = await User.findOne({ username });
        if (existing) return res.status(409).json({ error: 'Username already exists' });

        const user = new User({ username, password, currentStreak: 1, lastLogin: new Date() });
        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, username: user.username, currentStreak: user.currentStreak } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const valid = await user.comparePassword(password);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

        const newStreak = await updateStreak(user);

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, username: user.username, currentStreak: newStreak } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// GET /api/auth/me
router.get('/me', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
