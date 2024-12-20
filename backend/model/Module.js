import mongoose from 'mongoose'
// Define schema for questions
const questionSchema = new mongoose.Schema({
    questionText: { type: String, required: true }, // The question text
    options: [{ type: String, required: true }], // Array of multiple-choice options
    correctAnswer: { type: String, required: true }, // Correct answer text
  

});

// Define schema for each video
const videoSchema = new mongoose.Schema({
    title: { type: String, required: true }, // Title of the video
    description: { type: String, required: true }, // Description of the video
    videoUri: { type: String, required: true }, // Video link or URI
    questions: [questionSchema],
    // Array of questions related to the video
});

// Define the module schema that includes multiple videos
const moduleSchema = new mongoose.Schema({
    moduleName: { type: String, required: true }, // Name of the module
    videos: [videoSchema], // Array of video objects using videoSchema
    createdAt: { type: Date, default: Date.now }, // Timestamp when the module was created
});


const Module = mongoose.model('Module', moduleSchema)
export default Module