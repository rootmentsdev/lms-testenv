import mongoose from 'mongoose';

const StoreTargetSchema = new mongoose.Schema({
  storeName: { type: String, required: true }, // "All" (global configs) or specific store name
  month: { type: String, required: true }, // e.g. "June"
  year: { type: Number, default: 2026 },
  weekRanges: {
    1: { type: String, default: "Select Days" },
    2: { type: String, default: "Select Days" },
    3: { type: String, default: "Select Days" },
    4: { type: String, default: "Select Days" }
  },
  weeklyTargets: {
    1: { type: Number, default: 0 },
    2: { type: Number, default: 0 },
    3: { type: Number, default: 0 },
    4: { type: Number, default: 0 }
  }
}, { timestamps: true });

// Prevent duplicate entries for the same store name in the same month/year
StoreTargetSchema.index({ storeName: 1, month: 1, year: 1 }, { unique: true });

const StoreTarget = mongoose.model('StoreTarget', StoreTargetSchema);
export default StoreTarget;
