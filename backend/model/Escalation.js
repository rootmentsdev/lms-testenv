import mongoose from "mongoose";

// Define the Escalation Schema
const EscalationSchema = new mongoose.Schema({
    email: { type: String, required: true }, // Email of the recipient
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User or entity the Escalation is for
    toAdmin: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: "" }], // Admin associated with the escalation
    context: { type: String, required: true }, // Context or purpose of the Escalation
    deadline: { type: Date, required: true }, // Deadline for the task or assessment
    level: { type: Number, default: 0 }, // Escalation level
    completed: { type: Boolean, default: false }, // Completion status of the task
    createdAt: { type: Date, default: Date.now }, // Timestamp when the Escalation was created
    updatedAt: { type: Date, default: Date.now }, // 
    // Timestamp when the Escalation was last updated
});

// Automatically update `updatedAt` on document save
EscalationSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

// Create and export the model as default
const Escalation = mongoose.model("Escalation", EscalationSchema);

export default Escalation;
