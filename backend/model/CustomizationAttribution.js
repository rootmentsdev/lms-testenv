import mongoose from 'mongoose';

const CustomizationAttributionSchema = new mongoose.Schema({
  storeName: { type: String, required: true },
  date: { type: String }, // e.g. "2026-08-03"
  month: { type: String, required: true },
  year: { type: Number, required: true },
  week: { type: Number, default: 1 },
  totalValue: { type: Number, default: 0 },
  totalBills: { type: Number, default: 0 },
  totalQuantity: { type: Number, default: 0 },
  attributions: [{
    staffName: { type: String, default: 'Store Total' },
    billWtd: { type: Number, default: 0 },
    valWtd: { type: Number, default: 0 },
    qtyWtd: { type: Number, default: 0 }
  }]
}, { timestamps: true });

const CustomizationAttribution = mongoose.model('CustomizationAttribution', CustomizationAttributionSchema);
export default CustomizationAttribution;
