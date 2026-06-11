import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, unique: true, index: true, required: true },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    solvedCount: { type: Number, default: 0 },
    verifiedCount: { type: Number, default: 0 },
    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastActive: { type: String, default: null },
    },
    achievements: [{ key: String, earnedAt: Date }],
  },
  { timestamps: true },
);

export const Progress = mongoose.models.Progress || mongoose.model('Progress', progressSchema);
