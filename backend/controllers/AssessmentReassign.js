import TrainingProgress from "../model/Trainingprocessschema.js";
import { Training } from "../model/Traning.js";
import User from "../model/User.js";

export const GetAssessmentdetailes = async (req, res) => {
    try {
        const { id } = req.params;

    } catch (error) {
        res.status(500).json({
            message: "internal sever error"
        })
    }
}


export const AssignToUserAssessment = async (req, res) => {
    try {
        const { id } = req.params;

    } catch (error) {
        res.status(500).json({
            message: "internal sever error"
        })
    }
}


export const TrainingDetails = async (req, res) => {
    try {
        const { id } = req.params; // Get the training ID from the URL parameter

        // Fetch the training details
        const training = await Training.findById(id);
        if (!training) {
            return res.status(404).json({ message: "Training not found" });
        }

        // Fetch all users assigned to this training by querying the `User` collection
        const users = await User.find({ 'training.trainingId': id }).populate('training.trainingId'); // Populate the user information

        // Fetch the progress details from the TrainingProgress collection
        const progressDetails = await Promise.all(
            users.map(async (user) => {
                const progress = await TrainingProgress.findOne({ userId: user._id, trainingId: id });

                if (!progress) {
                    return {
                        userId: user._id,
                        userName: user.fullName,
                        userEmail: user.email,
                        progress: 0, // No progress if no record is found
                    };
                }

                let totalModules = 0;
                let completedModules = 0;
                let totalVideos = 0;
                let passedVideos = 0;

                // Loop through each module and its videos to calculate the completion
                progress.modules.forEach(module => {
                    totalModules += 1;

                    module.videos.forEach(video => {
                        totalVideos += 1;
                        if (video.pass) {
                            passedVideos += 1;
                        }
                    });

                    // If all videos in the module are passed, increase the completedModules count
                    const moduleCompletion = module.videos.length > 0 && module.videos.every(video => video.pass);
                    if (moduleCompletion) {
                        completedModules += 1;
                    }
                });

                // Calculate the overall completion percentage for the training
                const completionPercentage = totalVideos > 0 ? Math.round((passedVideos / totalVideos) * 100) : 0;
                const moduleCompletionPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
                const detaileduser = await User.findById(user._id)
                return {
                    user: detaileduser,
                    userEmail: user.email, // Populated email field
                    progress: completionPercentage, // Overall progress based on videos
                    moduleCompletion: moduleCompletionPercentage, // Completion based on modules
                };
            })
        );

        // Return the training details and the users' progress
        return res.status(200).json({
            training, // The training details
            progressDetails, // User progress details
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};