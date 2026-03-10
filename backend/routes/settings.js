import express from 'express';
import User from '../models/User.js';
import verifyToken from '../middleware/auth.js';

const router = express.Router();

// PUT /api/auth/settings — update username or password or profile info
router.put('/settings', verifyToken, async (req, res) => {
    const { newUsername, currentPassword, newPassword, linkedin, github, skills, targetJob } = req.body;

    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Update professional profile
        if (linkedin !== undefined) user.linkedin = linkedin;
        if (github !== undefined) user.github = github;
        if (targetJob !== undefined) user.targetJob = targetJob;
        if (skills !== undefined) {
            // Ensure skills is an array of strings
            user.skills = Array.isArray(skills) ? skills.map(s => String(s).trim()).filter(s => s) : [];
        }

        // Change username
        if (newUsername && newUsername !== user.username) {
            const exists = await User.findOne({ username: newUsername });
            if (exists) return res.status(409).json({ error: 'Username already taken' });
            user.username = newUsername;
        }

        // Change password
        if (newPassword) {
            if (!currentPassword) return res.status(400).json({ error: 'Current password required' });
            const valid = await user.comparePassword(currentPassword);
            if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });
            user.password = newPassword; // pre-save hook will hash it
        }

        await user.save();
        res.json({ success: true, username: user.username });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error updating settings' });
    }
});

export default router;
