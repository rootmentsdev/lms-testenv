import Assessment from "../model/Assessment.js";
import Module from "../model/Module.js";
import TrainingProgress from "../model/Trainingprocessschema.js";
import { Training } from "../model/Traning.js";
import User from "../model/User.js";



// Controller function to create an assessment
export const createAssessment = async (req, res) => {
    try {
        const assessmentData = req.body;

        // Validate input
        if (!assessmentData.title || !assessmentData.description || !Array.isArray(assessmentData.questions)) {
            return res.status(400).json({ message: "Invalid assessment data. Ensure all required fields are present." });
        }

        // Create and save the assessment
        const newAssessment = new Assessment(assessmentData);
        await newAssessment.save();

        res.status(201).json({ message: "Assessment created successfully!", assessment: newAssessment });
    } catch (error) {
        console.error("Error creating assessment:", error);
        res.status(500).json({ message: "An error occurred while creating the assessment.", error: error.message });
    }
};


export const getAssessments = async (req, res) => {
    try {
        const { id } = req.params; // Extract assessment ID if provided

        if (id) {
            // Fetch a specific assessment by ID
            const assessment = await Assessment.findById(id).populate('questions');
            if (!assessment) {
                return res.status(404).json({ message: 'Assessment not found' });
            }
            return res.status(200).json(assessment);
        }

        // Fetch all assessments
        const assessments = await Assessment.find().populate('questions');
        return res.status(200).json(assessments);
    } catch (error) {
        console.error('Error fetching assessments:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createTraining = async (req, res) => {
    const { trainingName, modules, days, workingBranch } = req.body;
    console.log(trainingName, modules, days, workingBranch);

    try {
        // Ensure that all required data is provided
        if (!trainingName || !modules || !days || !workingBranch) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Fetch details of modules from Module collection
        const moduleDetails = await Module.find({ _id: { $in: modules } }).populate('videos');

        if (moduleDetails.length === 0) {
            return res.status(404).json({ message: "Modules not found" });
        }

        // Create a new training record
        const newTraining = new Training({
            trainingName,
            modules,
            deadline: Date.now() + (days * 24 * 60 * 60 * 1000), // Deadline based on the number of days
        });

        // Save the training record
        await newTraining.save();

        // Fetch all users belonging to the specified branch
        const usersInBranch = await User.find({ locCode: workingBranch });

        if (usersInBranch.length === 0) {
            return res.status(404).json({ message: "No users found in the specified branch" });
        }

        // Assign training and progress to each user
        const updatedUsers = usersInBranch.map(async (user) => {
            // Add training details to user
            user.training.push({
                trainingId: newTraining._id,
                deadline: newTraining.deadline,
                pass: false,
                status: 'Pending',
            });

            // Create training progress for each user
            const trainingProgress = new TrainingProgress({
                userId: user._id,
                trainingId: newTraining._id,
                deadline: newTraining.deadline,
                pass: false,
                modules: moduleDetails.map(module => ({
                    moduleId: module._id,
                    pass: false,
                    videos: module.videos.map(video => ({
                        videoId: video._id,
                        pass: false,
                    })),
                })),
            });

            await trainingProgress.save();
            return user.save();
        });

        await Promise.all(updatedUsers); // Save all users at once

        res.status(201).json({ message: "Training created and assigned successfully", training: newTraining });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
