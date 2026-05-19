import mongoose from 'mongoose';

const walkinSchema = new mongoose.Schema({
    date: {
        type: String, // stored as DD-MM-YYYY or ISO string depending on input, let's make it flexible
        required: true
    },
    customerName: {
        type: String,
        required: true,
        trim: true
    },
    contact: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    functionDate: {
        type: String,
        default: '-',
        trim: true
    },
    store: {
        type: String,
        default: '-',
        trim: true
    },
    staff: {
        type: String,
        default: 'None',
        trim: true
    },
    category: {
        type: String,
        default: '-',
        trim: true
    },
    subCategory: {
        type: String,
        default: '-',
        trim: true
    },
    remarks: {
        type: String,
        default: '-',
        trim: true
    },
    repeatCount: {
        type: Number,
        default: 1
    },
    status: {
        type: String,
        default: 'New Walkin',
        trim: true
    }
}, {
    timestamps: true
});

const Walkin = mongoose.model('Walkin', walkinSchema);

export default Walkin;
