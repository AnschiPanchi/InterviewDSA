import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true },
    skills: [{ type: String, trim: true }],
    targetJob: { type: String, trim: true },
    isVerified: { type: Boolean, default: true },
    otp: { type: String },
    otpExpires: { type: Date },
    lastLogin: { type: Date, default: null },
    currentStreak: { type: Number, default: 0 },
    // Forge onboarding
    forgeComplete: { type: Boolean, default: false },
    weakTopics: [{ type: String, trim: true }],
    // Duel stats
    duelWins: { type: Number, default: 0 },
    duelLosses: { type: Number, default: 0 },
    // Adaptive Quiz Engine (SM-2 / IRT)
    abilityScore: { type: Number, default: 5 }, // 1-10
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    quizHistory: [{
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        lastTested: Date,
        nextTest: Date,
        interval: { type: Number, default: 0 },
        easinessFactor: { type: Number, default: 2.5 },
        repetitions: { type: Number, default: 0 }
    }],
    // Achievements
    achievements: [{
        id: String,
        earnedAt: { type: Date, default: Date.now },
        metadata: mongoose.Schema.Types.Mixed
    }],
    battleBadges: [{ type: String, trim: true }],
    creatorBadges: [{ type: String, trim: true }],
}, { timestamps: true });

// Hash password before saving (Mongoose 7+ async hooks don't use next())
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
