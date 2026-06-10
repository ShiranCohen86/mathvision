import mongoose from 'mongoose';

const solveSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, index: true, required: true },
    input: String,
    problemLatex: String,
    finalAnswer: String,
    verified: Boolean,
    type: String,
    source: String,
    solution: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true },
);

export const Solve = mongoose.models.Solve || mongoose.model('Solve', solveSchema);
