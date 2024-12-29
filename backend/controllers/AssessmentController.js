import Assessment from "../model/Assessment.js";
import Branch from "../model/Branch.js";
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
    const { trainingName, modules, days, workingBranch, selectedOption } = req.body;
    console.log(trainingName, modules, days, workingBranch, selectedOption);

    try {
        // Ensure all required data is provided
        if (!trainingName || !modules || !days || !selectedOption) {
            return res.status(400).json({ message: "Training name, modules, days, and selected option are required" });
        }

        // Fetch details of modules from Module collection
        const moduleDetails = await Module.find({ _id: { $in: modules } }).populate('videos');

        if (moduleDetails.length === 0) {
            return res.status(404).json({ message: "Modules not found" });
        }

        // Calculate deadline in **Date format**
        const deadlineDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

        // Create a new training record with deadline stored as a Date
        const newTraining = new Training({
            trainingName,
            modules,
            deadline: days, // Store deadline as a proper Date object
        });

        // Save the training record
        await newTraining.save();

        let usersInBranch = [];

        // Logic based on the selectedOption
        if (selectedOption === 'user') {
            if (!workingBranch || workingBranch.length === 0) {
                return res.status(400).json({ message: "User IDs are required when selectedOption is 'user'" });
            }
            usersInBranch = await User.find({ _id: { $in: workingBranch } });
        } else if (selectedOption === 'designation') {
            if (!workingBranch) {
                return res.status(400).json({ message: "Designation is required when selectedOption is 'designation'" });
            }
            usersInBranch = await User.find({ designation: workingBranch });
        } else if (selectedOption === 'branch') {
            if (!workingBranch) {
                return res.status(400).json({ message: "Working branch is required when selectedOption is 'branch'" });
            }
            usersInBranch = await User.find({ locCode: workingBranch });
        } else {
            return res.status(400).json({ message: "Invalid selected option" });
        }

        if (usersInBranch.length === 0) {
            return res.status(404).json({ message: "No users found matching the criteria" });
        }

        // Assign training and progress to each user
        const updatedUsers = usersInBranch.map(async (user) => {
            // Add training details to user
            user.training.push({
                trainingId: newTraining._id,
                deadline: deadlineDate, // Use the fixed deadline Date object
                pass: false,
                status: 'Pending',
            });

            // Create training progress for each user
            const trainingProgress = new TrainingProgress({
                userId: user._id,
                trainingId: newTraining._id,
                deadline: deadlineDate, // Use the fixed deadline Date object
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




export const GetTrainingById = async (req, res) => {
    const { id } = req.params; // Extract the training ID from request params

    try {
        // Find the training by ID and populate modules
        const training = await Training.findById(id).populate({
            path: 'modules',
            model: 'Module',
        });

        // Check if training exists
        if (!training) {
            return res.status(404).json({ message: 'Training not found' });
        }

        // Fetch users associated with the training and their progress
        const users = await User.find({ 'training.trainingId': id }).populate({
            path: 'training.trainingId',
            model: 'Training',
        });

        const userProgress = await Promise.all(
            users.map(async (user) => {
                const trainingProgress = await TrainingProgress.findOne({
                    userId: user._id,
                    trainingId: id,
                });

                if (!trainingProgress) return null;

                let totalModules = 0;
                let totalVideos = 0;
                let completedVideos = 0;
                let completedModules = 0;

                // Track overall completion per user for each module
                const moduleCompletion = trainingProgress.modules.map((module) => {
                    totalModules++;

                    let totalVideosInModule = module.videos.length;
                    let completedVideosInModule = 0;

                    // Count completed videos (those with pass: true)
                    module.videos.forEach((video) => {
                        totalVideos++;
                        if (video.pass) {
                            completedVideos++;
                            completedVideosInModule++;
                        }
                    });

                    // Calculate module completion percentage
                    const moduleCompletionPercentage = totalVideosInModule > 0
                        ? (completedVideosInModule / totalVideosInModule) * 100
                        : 0;

                    // Check if the module is marked as completed
                    if (module.pass) {
                        completedModules++;
                    }

                    return {
                        moduleId: module.moduleId,
                        pass: module.pass,
                        videosCompleted: completedVideosInModule,
                        totalVideos: totalVideosInModule,
                        moduleCompletionPercentage: moduleCompletionPercentage.toFixed(2),
                    };
                });

                // Calculate overall completion for the user based on video completion and module completion
                const overallCompletionPercentage = totalVideos > 0
                    ? (completedVideos / totalVideos) * 100
                    : 0;

                return {
                    userId: user._id,
                    username: user.username,
                    email: user.email,
                    modules: moduleCompletion,
                    overallCompletionPercentage: overallCompletionPercentage.toFixed(2),
                };
            })
        );

        // Combine the users into one array and filter out null progress
        const combinedUserProgress = userProgress.filter((user) => user !== null);

        // Calculate average completion percentage across all users
        let totalCompletionPercentage = 0;
        let totalUsers = combinedUserProgress.length;

        combinedUserProgress.forEach((user) => {
            totalCompletionPercentage += parseFloat(user.overallCompletionPercentage);
        });

        const averageCompletionPercentage = totalUsers > 0
            ? (totalCompletionPercentage / totalUsers).toFixed(2)
            : 0;

        // Return training data with populated modules, user progress, and overall completion
        res.status(200).json({
            message: 'Training data found',
            data: training,
            users: combinedUserProgress,
            averageCompletionPercentage,
        });
    } catch (error) {
        console.error('Error fetching training by ID:', error.message);
        res.status(500).json({ message: 'Server error while fetching training data' });
    }
};



export const calculateProgress = async (req, res) => {
    try {
        // Count documents in collections
        const assessmentCount = await Assessment.countDocuments();
        const branchCount = await Branch.countDocuments();
        const userCount = await User.countDocuments();

        // Fetch all trainings
        const trainings = await TrainingProgress.find();

        // Calculate completion percentage for each training
        const progressArray = trainings.map((training) => {
            // Validate if 'modules' exists and is an array
            if (!training.modules || !Array.isArray(training.modules)) {
                return 0; // Skip invalid training entries
            }

            const totalModules = training.modules.length;
            let completedModules = 0;

            training.modules.forEach((module) => {
                // Validate 'videos' array inside each module
                const totalVideos = module.videos && Array.isArray(module.videos) ? module.videos.length : 0;
                const completedVideos =
                    module.videos?.filter((video) => video.pass).length || 0;

                // Mark module as complete only if all videos are completed
                if (module.pass && completedVideos === totalVideos) {
                    completedModules++;
                }
            });

            // Calculate module completion percentage
            return totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
        });

        // Calculate overall average progress
        const averageProgress =
            progressArray.length > 0
                ? progressArray.reduce((a, b) => a + b, 0) / progressArray.length
                : 0;

        // Return results
        res.status(200).json({
            success: true,
            data: {
                assessmentCount,
                branchCount,
                userCount,
                averageProgress: averageProgress.toFixed(2), // Percentage
            },
        });
    } catch (error) {
        console.error('Error calculating progress:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};


