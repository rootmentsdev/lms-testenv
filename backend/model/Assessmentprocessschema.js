import mongoose from "mongoose";

const assessmentProcessSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment', // Link to the Assessment model
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending', // Default status is 'Pending'
  },
  answers: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AssessmentQuestion', // Link to the Assessment Question model
        required: true,
      },
      selectedAnswer: {
        type: String, // The answer selected by the user
        required: true,
      },
      isCorrect: {
        type: Boolean, // Whether the selected answer is correct
        default: false,
      },
    },
  ],
  totalMarks: {
    type: Number,
    default: 0, // To store the total marks the user scored
  },
  duration: {
    type: Number, // The duration of the assessment in minutes
    required: true,
  },
  passed: {
    type: Boolean,
    default: false, // Whether the user passed the assessment
  },
  createdAt: {
    type: Date,
    default: Date.now, // Timestamp when the assessment process was created
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Timestamp when the assessment process was last updated
  },
});

assessmentProcessSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Create and export the model
const AssessmentProcess = mongoose.model('AssessmentProcess', assessmentProcessSchema);
export default AssessmentProcess;
