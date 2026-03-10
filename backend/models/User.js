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
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    lastLogin: { type: Date, default: null },
    currentStreak: { type: Number, default: 0 }
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
