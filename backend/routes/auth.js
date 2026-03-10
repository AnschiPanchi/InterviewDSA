import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import verifyToken from '../middleware/auth.js';
import sendEmail from '../utils/sendEmail.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { username, password, email, captchaAnswer, captchaQuestion } = req.body;
    
    if (!username || !password || !email) {
        return res.status(400).json({ error: 'Username, email, and password required' });
    }

    // Simple math captcha validation
    // captchaQuestion format: "5 + 3"
    try {
        const parts = captchaQuestion.split(' ');
        const num1 = parseInt(parts[0]);
        const op = parts[1];
        const num2 = parseInt(parts[2]);
        let expected;
        if (op === '+') expected = num1 + num2;
        else if (op === '-') expected = num1 - num2;
        
        if (parseInt(captchaAnswer) !== expected) {
            return res.status(400).json({ error: 'Incorrect captcha answer. Please try again.' });
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
            password, // Schema hook hashes this
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
        console.error(err);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username/Email and password required' });
    }

    try {
        // Find by username OR email
        const user = await User.findOne({ 
            $or: [{ username: username }, { email: username }] 
        });
        
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const valid = await user.comparePassword(password);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

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

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            // Silently return success to prevent email enumeration
            return res.json({ message: 'If an account with that email exists, a reset code has been sent.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        await user.save();

        await sendEmail({
            to: email,
            subject: 'InterviewDSA - Password Reset Code',
            html: `<p>Your password reset code is: <strong>${otp}</strong></p><p>This code will expire in 15 minutes.</p>`
        });

        res.json({ message: 'If an account with that email exists, a reset code has been sent.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to process forgot password request' });
    }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid request' });
        
        if (user.otp !== otp) return res.status(400).json({ error: 'Invalid reset code' });
        if (new Date() > user.otpExpires) return res.status(400).json({ error: 'Reset code has expired' });

        user.password = newPassword; // Will be hashed by pre-save hook
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successful. You can now log in.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during password reset' });
    }
});

export default router;
