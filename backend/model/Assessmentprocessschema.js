import mongoose from 'mongoose';

const assessmentProcessSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment',
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending',
  },
  answers: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AssessmentQuestion', // Refers to the question in the assessment
        required: true,
      },
      selectedAnswer: {
        type: String, // The selected answer by the user

        default: ""
      },
      correctAnswer: {
        type: String,
        default: ""
      },
      isCorrect: {
        type: Boolean, // Whether the selected answer is correct
        default: false,
      },
    },
  ],
  totalMarks: {
    type: Number,
    default: 0, // Total score of the user based on correct answers
  },
  passed: {
    type: Boolean,
    default: false, // Whether the user passed or failed
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to update the `updatedAt` field
assessmentProcessSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Create and export the model
const AssessmentProcess = mongoose.model('AssessmentProcess', assessmentProcessSchema);
export default AssessmentProcess;
