import mongoose from "mongoose";

const staffPerformanceSchema = new mongoose.Schema(
  {
    staffName: { type: String, required: true, trim: true },
    empID: { type: String, trim: true, default: null },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    
    // 10 rating categories (integer values from 1 to 5)
    punctuality: { type: Number, required: true, min: 1, max: 5 },
    leaveDiscipline: { type: Number, required: true, min: 1, max: 5 },
    groomingStandards: { type: Number, required: true, min: 1, max: 5 },
    customerEtiquette: { type: Number, required: true, min: 1, max: 5 },
    teamwork: { type: Number, required: true, min: 1, max: 5 },
    productOwnership: { type: Number, required: true, min: 1, max: 5 },
    customerIssueOwnership: { type: Number, required: true, min: 1, max: 5 },
    sopAdherence: { type: Number, required: true, min: 1, max: 5 },
    adapting: { type: Number, required: true, min: 1, max: 5 },
    learningAttitude: { type: Number, required: true, min: 1, max: 5 },
    
    averageScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

staffPerformanceSchema.index({ staffName: 1 });
staffPerformanceSchema.index({ empID: 1 });
staffPerformanceSchema.index({ managerId: 1 });
staffPerformanceSchema.index({ createdAt: -1 });

// Pre-save hook to calculate the average score of the 10 categories
staffPerformanceSchema.pre("save", function (next) {
  const sum =
    (this.punctuality || 0) +
    (this.leaveDiscipline || 0) +
    (this.groomingStandards || 0) +
    (this.customerEtiquette || 0) +
    (this.teamwork || 0) +
    (this.productOwnership || 0) +
    (this.customerIssueOwnership || 0) +
    (this.sopAdherence || 0) +
    (this.adapting || 0) +
    (this.learningAttitude || 0);
  this.averageScore = parseFloat((sum / 10).toFixed(1));
  next();
});

const StaffPerformance = mongoose.model("StaffPerformance", staffPerformanceSchema);

export default StaffPerformance;
