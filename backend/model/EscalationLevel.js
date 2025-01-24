import mongoose from "mongoose";

const EscalationLevelSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true,
    },
    level: {
        type: Number,
        required: true,
    },
    context: {
        type: String,
        required: true,
    },
    numberOfDays: {
        type: mongoose.Schema.Types.Mixed, // Allows both numbers and strings
        required: true,
    },
});

const EscalationLevel = mongoose.model("EscalationLevel", EscalationLevelSchema);

export default EscalationLevel;
