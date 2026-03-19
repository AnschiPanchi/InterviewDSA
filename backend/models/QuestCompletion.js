import mongoose from 'mongoose';

const questCompletionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    questId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quest', required: true },
    completedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['completed', 'failed'], default: 'completed' },
    xpAwarded: { type: Number },
}, { timestamps: true });

// Ensure a user can only complete a specific quest once
questCompletionSchema.index({ userId: 1, questId: 1 }, { unique: true });

const QuestCompletion = mongoose.model('QuestCompletion', questCompletionSchema);
export default QuestCompletion;
