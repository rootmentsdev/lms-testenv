import mongoose from 'mongoose';

const DapprAttributionSchema = new mongoose.Schema({
  storeName: { type: String, required: true }, // display store name, e.g. "G-Edappally"
  month: { type: String, required: true },     // e.g. "June"
  year: { type: Number, required: true },      // e.g. 2026
  week: { type: Number, required: true },      // 1, 2, 3, or 4
  attributions: [{
    staffName: { type: String, required: true },
    billWtd: { type: Number, default: 0 },
    valWtd: { type: Number, default: 0 },
    qtyWtd: { type: Number, default: 0 }
  }]
}, { timestamps: true });

// Prevent duplicate attributions for the same store, week, month, year
DapprAttributionSchema.index({ storeName: 1, month: 1, year: 1, week: 1 }, { unique: true });

const DapprAttribution = mongoose.model('DapprAttribution', DapprAttributionSchema);
export default DapprAttribution;
