import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phoneNumber: { type: String, default: "", },
    EmpId: { type: String, required: true },
    role: {
        type: String,
        enum: ['super_admin', 'cluster_admin', 'store_admin'],
        required: true,
    },
    subRole: {
        type: String,
        default: 'NR',
        required: true,
    },
    password: { type: String, min: 6, },
    permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
    branches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }],
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;







