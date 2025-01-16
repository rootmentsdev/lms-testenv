import mongoose from "mongoose";
const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    body: {
        type: String,
        required: true,
        trim: true,
    },
    branch: {
        type: [String],  // Array of strings
        default: [],     // Default value is an empty array
    },
    user: {
        type: [mongoose.Schema.Types.ObjectId], // Change to an array of ObjectId
        ref: 'User',     // Reference to User model
        default: [],     // Default to an empty array
    },
    Role: {
        type: [String],  // Array of strings
        default: [],     // Default value is an empty array
    },
    useradmin: {
        type: String,
        default: "",     // Default value is an empty string
    },
    category: {
        type: String,
        default: "Training",     // Default value is "Training"
    },
    createdAt: {
        type: Date,
        default: Date.now,  // Automatically set the current date
    },
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
