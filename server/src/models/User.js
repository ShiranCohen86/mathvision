import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, index: true, unique: true, sparse: true },
    email: { type: String, index: true },
    displayName: String,
    avatar: String,
    locale: { type: String, default: 'he' },
    role: { type: String, enum: ['parent', 'child', 'member'], default: 'member' },
  },
  { timestamps: true },
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);
