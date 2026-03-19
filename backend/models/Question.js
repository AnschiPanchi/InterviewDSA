import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctOption: { type: Number, required: true }, // index of the correct option
    explanation: { type: String },
    difficulty_level: { type: Number, required: true, min: 1, max: 10 },
    topic: { type: String, required: true },
    
    // Creator Economy (Community Quests)
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['draft', 'approved'], default: 'approved' },
    upvotes: { type: Number, default: 0 }
}, { timestamps: true });

const Question = mongoose.model('Question', questionSchema);
export default Question;
