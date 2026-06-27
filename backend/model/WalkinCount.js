import mongoose from 'mongoose';

const walkinCountSchema = new mongoose.Schema({
    date: {
        type: String, // YYYY-MM-DD
        required: true,
        index: true
    },
    store: {
        type: String, // Store Name
        required: true
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    },
    counts: [{
        statusKey: {
            type: String, // e.g. 'total_walkin', 'walkin', 'new_loss', etc.
            required: true
        },
        inCam: {
            type: String,
            default: '-'
        },
        salesReport: {
            type: String,
            default: '-'
        },
        timeSeen: {
            type: String,
            default: ''
        },
        remarks: {
            type: String,
            default: ''
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {
    timestamps: true
});

// Compound unique constraint: exactly one document per date and store
walkinCountSchema.index({ date: 1, storeId: 1 }, { unique: true });

const WalkinCount = mongoose.model('WalkinCount', walkinCountSchema);

export default WalkinCount;
