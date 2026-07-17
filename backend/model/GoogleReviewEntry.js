import mongoose from 'mongoose';

const googleReviewEntrySchema = new mongoose.Schema({
  branchId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null },
  branchName:    { type: String, required: true, trim: true }, // workingBranch name
  count:         { type: Number, required: true, min: 0 },     // number of Google reviews entered
  rating:        { type: Number, min: 0, max: 5 }, // average Google rating entered
  enteredBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  enteredByName: { type: String, default: '' },
  date:          { type: String, required: true },             // ISO date string YYYY-MM-DD
}, { timestamps: true });

// Compound index for efficient per-branch/date queries
googleReviewEntrySchema.index({ branchName: 1, date: 1 });

const GoogleReviewEntry = mongoose.model('GoogleReviewEntry', googleReviewEntrySchema);
export default GoogleReviewEntry;
