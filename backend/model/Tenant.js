import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        default: '',
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'suspended'],
        default: 'active',
        index: true
    },
    plan: {
        type: String,
        enum: ['trial', 'basic', 'pro', 'enterprise'],
        default: 'trial',
        index: true
    },
    subscriptionStatus: {
        type: String,
        enum: ['active', 'past_due', 'cancelled'],
        default: 'active',
        index: true
    },
    allowedModules: {
        type: [String],
        default: ['dashboard', 'dsr_report', 'employee', 'branch', 'settings']
    }
}, {
    timestamps: true
});

// Indexes for search & listing performance
tenantSchema.index({ name: 1 });
tenantSchema.index({ status: 1, plan: 1 });

const Tenant = mongoose.model('Tenant', tenantSchema);

export default Tenant;
