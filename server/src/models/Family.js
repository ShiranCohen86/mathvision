import mongoose from 'mongoose';

const familySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    inviteCode: { type: String, unique: true, index: true, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { timestamps: true },
);

export const Family = mongoose.models.Family || mongoose.model('Family', familySchema);
