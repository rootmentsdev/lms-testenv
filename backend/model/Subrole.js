import mongoose from 'mongoose';

const subroleSchema = new mongoose.Schema(
  {
    subrole: {
      type: String,
      required: true,
      trim: true,
    },
    roleCode: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      enum: ['Level 1', 'Level 2', 'Level 3'],
      required: true,
    },
  },
  {
    timestamps: true, // Adds `createdAt` and `updatedAt` fields automatically
  }
);

const Subrole = mongoose.model('Subrole', subroleSchema);

export default Subrole;
