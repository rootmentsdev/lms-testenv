import mongoose from "mongoose";


const designationSchema = new mongoose.Schema({

    designation: {
        type: String,
        required: true,

    },
}, {
    timestamps: true,
});

const Designation = mongoose.model('designation', designationSchema);

export default Designation; 