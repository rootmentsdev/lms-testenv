import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    actorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true,
        index: true
    },
    actorRole: {
        type: String,
        required: true,
        default: 'super_admin'
    },
    actorEmail: {
        type: String,
        default: ''
    },
    action: {
        type: String,
        required: true,
        enum: [
            'CREATE_COMPANY',
            'UPDATE_COMPANY',
            'SUSPEND_COMPANY',
            'ACTIVATE_COMPANY',
            'CHANGE_PLAN',
            'CREATE_USER',
            'DISABLE_USER'
        ],
        index: true
    },
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        default: null,
        index: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
