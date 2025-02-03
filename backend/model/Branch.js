import mongoose from "mongoose";


const branchSchema = new mongoose.Schema({
    locCode: {
        type: String,
        required: true,
        unique: true,
    },
    workingBranch: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        default: "",
        required: true,
    },
    location: {
        type: String,
        default: "",
        required: true,
    }, address: {
        type: String,
        default: "",
        required: true
    },
    manager: {
        type: String,
        default: "",
        required: true
    }
}, {
    timestamps: true,
});

const Branch = mongoose.model('Branch', branchSchema);

export default Branch;  // Using default export
