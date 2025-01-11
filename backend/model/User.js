import mongoose, { trusted } from 'mongoose';

// Define schema for assigned modules
const assignedModuleSchema = new mongoose.Schema({
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true }, // Reference to a module
    deadline: { type: Date, required: true }, // Deadline for the module
    pass: { type: Boolean, default: false },
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' } // Current status
});

// Define schema for assigned assessments
const assignedAssessmentSchema = new mongoose.Schema({
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true }, // Reference to an assessment
    deadline: { type: Date, required: true }, // Deadline for the assessment
    pass: { type: Boolean, default: false },

    status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
    complete: { type: Number, default: 0 }// Current status
});
const trainingSchema = new mongoose.Schema({
    trainingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Training', required: true }, // Reference to an assessment
    deadline: { type: Date, required: true }, // Deadline for the assessment
    pass: { type: Boolean, default: false },

    status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' } // Current status
});


const userSchema = new mongoose.Schema({
    username: { type: String, required: true, }, // User's username
    email: { type: String, required: true, unique: true },
    locCode: { type: String, required: true }, // User's email
    empID: { type: String, required: true, unique: true }, // Employee ID
    designation: { type: String, required: true },
    workingBranch: { type: String, required: true }, // User's working branch
    assignedModules: [assignedModuleSchema], // Array of assigned modules
    assignedAssessments: [assignedAssessmentSchema],
    training: [trainingSchema],// Array of assigned assessments
    createdAt: { type: Date, default: Date.now }, // Timestamp when the user was created
    updatedAt: { type: Date, default: Date.now }, // Timestamp when the user was last updated
});

userSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const User = mongoose.model('User', userSchema);
export default User;


// //user designation
