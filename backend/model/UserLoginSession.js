import mongoose from "mongoose";

const userLoginSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    deviceType: {
        type: String,
        enum: ['desktop', 'mobile', 'tablet'],
        required: true
    },
    deviceOS: {
        type: String,
        enum: ['windows', 'mac', 'linux', 'android', 'ios', 'unknown'],
        required: true
    },
    browser: {
        type: String,
        required: true
    },
    browserVersion: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    ipAddress: {
        type: String,
        required: true
    },
    location: {
        country: String,
        city: String,
        region: String
    },
    loginTime: {
        type: Date,
        default: Date.now
    },
    logoutTime: {
        type: Date,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    sessionDuration: {
        type: Number, // in minutes
        default: 0
    }
}, {
    timestamps: true
});

// Index for better query performance
userLoginSessionSchema.index({ userId: 1, loginTime: -1 });
userLoginSessionSchema.index({ deviceType: 1, deviceOS: 1 });
userLoginSessionSchema.index({ isActive: 1 });

const UserLoginSession = mongoose.model('UserLoginSession', userLoginSessionSchema);

export default UserLoginSession;
