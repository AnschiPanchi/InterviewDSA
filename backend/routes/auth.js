import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import verifyToken from '../middleware/auth.js';
import sendEmail from '../utils/sendEmail.js';

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
    console.log('Registration attempt:', req.body);
    const { username, password, email, captchaAnswer, captchaQuestion } = req.body;
    
    if (!username || !password || !email) {
        return res.status(400).json({ error: 'Username, email, and password required' });
    }

    // Math captcha validation
    try {
        const parts = captchaQuestion.split(' ');
        const num1 = parseInt(parts[0]);
        const op = parts[1];
        const num2 = parseInt(parts[2]);
        let expected;
        if (op === '+') expected = num1 + num2;
        else if (op === '-') expected = num1 - num2;
        
        if (parseInt(captchaAnswer) !== expected) {
            return res.status(400).json({ error: 'Incorrect captcha answer' });
        }
    } catch (err) {
        return res.status(400).json({ error: 'Invalid captcha' });
    }

    try {
        const existing = await User.findOne({ 
            $or: [{ username }, { email }] 
        });
        
        if (existing) {
            if (existing.username === username) return res.status(409).json({ error: 'Username already exists' });
            if (existing.email === email) return res.status(409).json({ error: 'Email already registered' });
        }

        const user = new User({
            username,
            email,
            password,
            isVerified: true,
            currentStreak: 1,
            lastLogin: new Date()
        });
        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ 
            token, 
            user: { 
                id: user._id, 
                username: user.username, 
                email: user.email,
                currentStreak: user.currentStreak
            } 
        });
    } catch (err) {
        console.error('REGISTRATION ERROR:', err);
        res.status(500).json({ error: 'Server error during registration', details: err.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username/Email and password required' });
    }

    try {
        const user = await User.findOne({ 
            $or: [{ username: username }, { email: username }] 
        });
        
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const valid = await user.comparePassword(password);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

        // Update streak on login
        const newStreak = await updateStreak(user);

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, username: user.username, email: user.email, currentStreak: newStreak } });
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

// POST /api/auth/forgot-password (placeholder)
router.post('/forgot-password', async (req, res) => {
    res.status(501).json({ error: 'Reset password is temporarily disabled. Please contact support.' });
});

export default router;
