import mongoose from 'mongoose';

const walkinCameraCheckSchema = new mongoose.Schema({
    date: {
        type: String, // YYYY-MM-DD
        required: true,
        index: true
    },
    store: {
        type: String, // Store name
        required: true
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    },
    statusKey: {
        type: String, // e.g. 'total_walkin', 'walkin', 'new_loss', etc.
        required: true
    },
    timeDuration: {
        type: String, // e.g. '10:00 AM to 10:30 AM'
        required: true
    },
    inCamCount: {
        type: Number,
        required: true,
        default: 0
    },
    remarks: {
        type: String,
        default: ''
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    }
}, {
    timestamps: true
});

// Ensure a single entry per date, store, statusKey, and timeDuration
walkinCameraCheckSchema.index({ date: 1, storeId: 1, statusKey: 1, timeDuration: 1 }, { unique: true });

const WalkinCameraCheck = mongoose.model('WalkinCameraCheck', walkinCameraCheckSchema);

export default WalkinCameraCheck;
