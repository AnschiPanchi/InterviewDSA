import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import connectDB from './db.js';
import authRoutes from './routes/auth.js';
import aiRoutes from './routes/ai.js';
import performanceRoutes from './routes/performance.js';
import settingsRoutes from './routes/settings.js';
import leaderboardRoutes from './routes/leaderboard.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/auth', settingsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Wait for MongoDB to connect BEFORE accepting requests
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to connect to MongoDB, server not started:', err.message);
    process.exit(1);
});
