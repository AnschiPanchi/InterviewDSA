import mongoose from 'mongoose';

const attemptSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topic: { type: String },
    difficulty: { type: String },
    question: { type: String },
    code: { type: String },
    timeSpent: { type: Number },
    score: { type: Number },
    feedbackSummary: { type: String },
    strengths: [String],
    areasForImprovement: [String],
}, { timestamps: true });

const Attempt = mongoose.model('Attempt', attemptSchema);
export default Attempt;
