import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import verifyToken from '../middleware/auth.js';
import sendEmail from '../utils/sendEmail.js';

const router = express.Router();

// Temporary in-memory store for pending registrations.
// In a true large-scale production app, this would be Redis.
// Key: email (string), Value: { username, email, password, otp, expires }
const tempOtpStore = new Map();

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
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
        return res.status(400).json({ error: 'Username, email, and password required' });
    }

    try {
        const existing = await User.findOne({ 
            $or: [{ username }, { email }] 
        });
        
        if (existing) {
            if (existing.username === username) return res.status(409).json({ error: 'Username already exists' });
            if (existing.email === email) return res.status(409).json({ error: 'Email already registered' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        // Store user in volatile memory instead of MongoDB
        tempOtpStore.set(email, {
            username, 
            email, 
            password, 
            otp,
            otpExpires
        });

        await sendEmail({
            to: email,
            subject: 'InterviewDSA - Verify your Email',
            html: `<h3>Welcome to InterviewDSA!</h3><p>Your verification code is: <strong>${otp}</strong></p><p>This code will expire in 15 minutes.</p>`
        });

        res.json({ message: 'Registration successful. Please verify your email.', email });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const pendingUser = tempOtpStore.get(email);
        if (!pendingUser) return res.status(404).json({ error: 'Registration session expired or does not exist.' });
        
        if (pendingUser.otp !== otp) return res.status(400).json({ error: 'Invalid verification code' });
        if (new Date() > pendingUser.otpExpires) {
            tempOtpStore.delete(email); // Clean up expired session
            return res.status(400).json({ error: 'Verification code has expired. Please register again.' });
        }

        // OTP Validated! Now permanently save to MongoDB
        const user = new User({
            username: pendingUser.username,
            email: pendingUser.email,
            password: pendingUser.password, // Schema hook hashes this
            isVerified: true,
            currentStreak: 1,
            lastLogin: new Date()
        });
        await user.save();

        // Clear memory
        tempOtpStore.delete(email);

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ 
            token, 
            user: { 
                id: user._id, 
                username: user.username, 
                email: user.email,
                currentStreak: user.currentStreak,
                linkedin: user.linkedin,
                github: user.github,
                skills: user.skills,
                targetJob: user.targetJob
            } 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during verification' });
    }
});

// POST /api/auth/resend-otp
router.post('/resend-otp', async (req, res) => {
    const { email } = req.body;
    try {
        const pendingUser = tempOtpStore.get(email);
        if (!pendingUser) return res.status(404).json({ error: 'No pending registration found for this email.' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        pendingUser.otp = otp;
        pendingUser.otpExpires = new Date(Date.now() + 15 * 60 * 1000);

        await sendEmail({
            to: email,
            subject: 'InterviewDSA - Your New Verification Code',
            html: `<p>Your new verification code is: <strong>${otp}</strong></p><p>This code will expire in 15 minutes.</p>`
        });

        res.json({ message: 'A new verification code has been sent to your email.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to resend OTP' });
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

        if (!user.isVerified) {
            return res.status(403).json({ error: 'Please verify your email address to log in', isVerified: false, email: user.email });
        }

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
