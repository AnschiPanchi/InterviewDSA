import mongoose from 'mongoose';

const questSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['daily', 'weekly'], required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    xpReward: { type: Number, default: 50 },
    availableAt: { type: Date, required: true }, // The day this quest is for
}, { timestamps: true });

const Quest = mongoose.model('Quest', questSchema);
export default Quest;
