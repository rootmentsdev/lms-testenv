import mongoose from 'mongoose';

// Define schema for questions in the assessment
const assessmentQuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true }, // The question text
  options: [{ type: String, required: true }], // Array of multiple-choice options
  correctAnswer: { type: String, required: true }, // Correct answer text
});

// Define schema for assessment
const assessmentSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Title of the assessment
  description: { type: String, required: true }, // Brief description of the assessment
  questions: [assessmentQuestionSchema], // Array of questions
  state: { 
    type: String, 
    enum: ['Pending', 'Processing', 'Completed'], 
    default: 'Pending' 
  }, // Current state of the assessment
  createdAt: { type: Date, default: Date.now }, // Timestamp when the assessment was created
  updatedAt: { type: Date, default: Date.now }, // Timestamp when the assessment was last updated
});

// Export the model
const Assessment = mongoose.model('Assessment', assessmentSchema);
export default Assessment;
