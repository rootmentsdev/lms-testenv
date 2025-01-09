import Assessment from "../model/Assessment.js";
import AssessmentProcess from "../model/Assessmentprocessschema.js";
import Designation from "../model/designation.js";
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

        // Declare uniqueBranches set to store distinct branches
        const uniqueBranches = new Set();
        const uniquedesignation = new Set();
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

                // Fetch detailed user information
                const detaileduser = await User.findById(user._id);

                // Filter user training details by specific ID
                const filteredTraining = detaileduser.training.filter(t => t.trainingId.toString() === id);

                // Add unique working branches to the set
                uniqueBranches.add(detaileduser.workingBranch);
                uniquedesignation.add(detaileduser.designation)
                return {
                    user: { ...detaileduser._doc, training: filteredTraining },
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
            uniqueBranches: Array.from(uniqueBranches),
            uniquedesignation: Array.from(uniquedesignation)// Convert set to array
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const AssessmentAssign = async (req, res) => {
    try {
        const { assessmentId, assignedTo, days, selectedOption } = req.body;

        // Validate input
        if (!assessmentId || !assignedTo || !Array.isArray(assignedTo) || assignedTo.length === 0 || !days) {
            return res.status(400).json({ message: "All fields are required and 'assignedTo' must be a non-empty array." });
        }

        // Calculate deadline
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + days);

        const results = [];

        // Process each user based on the selected option
        // const processAssignment = async (userId) => {
        //     const user = await User.findById(userId);

        //     if (!user) {
        //         return { userId, message: "User not found." };
        //     }

        //     // Add the assessment to the user's assigned assessments
        //     user.assignedAssessments.push({
        //         assessmentId,
        //         deadline,
        //         status: 'Pending',
        //     });

        //     await user.save();

        //     // Fetch the assessment with populated questions
        //     const assessment = await Assessment.findById(assessmentId);
        //     console.log(assessment);

        //     if (!assessment) {
        //         return { userId, message: "Assessment not found." };
        //     }

        //     // Create the answers array for the user, initialized with empty answers for each question
        //     const answers = assessment.questions.map(question => ({
        //         questionId: question.questionId._id, // Correct population of question ID
        //         correctAnswer: question.correctAnswer, // Assuming correctAnswer field exists in the question schema
        //         isCorrect: false,    // Set to false until the user answers
        //     }));

        //     // Create a new assessment process record
        //     const newAssessmentProcess = new AssessmentProcess({
        //         userId,
        //         assessmentId,
        //         status: 'Pending',
        //         answers: answers, // Adding the questions and answers
        //     });

        //     await newAssessmentProcess.save();

        //     return {
        //         userId,
        //         message: "Assessment assigned successfully.",
        //         user,
        //         assessmentProcess: newAssessmentProcess,
        //     };
        // };

        // Process each user
        if (selectedOption === 'user') {
            for (const userId of assignedTo) {
                const user = await User.findById(userId);

                if (!user) {
                    results.push({ userId, message: "User not found." });
                    continue;
                }

                // Check if assessmentId is an array, and process each assessment individually
                const assessmentIds = Array.isArray(assessmentId) ? assessmentId : [assessmentId];

                for (const id of assessmentIds) {
                    const match = User.findOne({
                        _id: user._id,
                        assignedAssessments: {
                            $elemMatch: { assessmentId: id }
                        }
                    })
                    if (match) {
                        return res.json({ message: "already Assigned" })
                    }
                    // Add the assessment to the user's assigned assessments
                    user.assignedAssessments.push({
                        assessmentId: id, // Ensure this is a valid ObjectId
                        deadline,
                        status: 'Pending',
                    });
                }

                await user.save();

                // Create a new assessment process record for each assessmentId
                for (const id of assessmentIds) {
                    const assessments = await Assessment.findById(id);
                    console.log(assessments);

                    const answers = assessments.questions.map(question => ({
                        questionId: question._id, // Ensure correct questionId population
                        correctAnswer: question.correctAnswer,
                        isCorrect: false,   // Set to false until the user answers
                    }));

                    const newAssessmentProcess = new AssessmentProcess({
                        userId,
                        assessmentId: id,
                        answers: answers, // Store answers array
                        status: 'Pending',
                    });

                    await newAssessmentProcess.save();

                    results.push({
                        userId,
                        message: "Assessment assigned successfully.",
                        user,
                        assessmentProcess: newAssessmentProcess,
                    });
                }
            }
        }

        if (selectedOption === 'branch') {
            // Handle branch-specific assignments
            for (const locCode of assignedTo) {
                console.log(locCode);

                const users = await User.find({ locCode: locCode });
                console.log(users);

                if (users.length === 0) {
                    results.push({ locCode, message: "No users found for this location." });
                    continue;
                }

                // Check if assessmentId is an array, and process each assessment individually
                const assessmentIds = Array.isArray(assessmentId) ? assessmentId : [assessmentId];

                for (const user of users) {
                    for (const id of assessmentIds) {
                        user.assignedAssessments.push({
                            assessmentId: id,
                            deadline,
                            status: 'Pending',
                        });

                        await user.save();

                        const assessments = await Assessment.findById(id);
                        console.log(assessments);

                        const answers = assessments.questions.map(question => ({
                            questionId: question._id,
                            correctAnswer: question.correctAnswer,
                            isCorrect: false,
                        }));

                        const newAssessmentProcess = new AssessmentProcess({
                            userId: user._id,
                            assessmentId: id,
                            answers: answers,
                            status: 'Pending',
                        });

                        await newAssessmentProcess.save();

                        results.push({
                            userId: user._id,
                            message: "Assessment assigned successfully.",
                            user,
                            assessmentProcess: newAssessmentProcess,
                        });
                    }
                }
            }
        }

        if (selectedOption === 'designation') {
            // Handle designation-specific assignments
            for (const designationId of assignedTo) {
                console.log(designationId);

                const designation = await Designation.findById(designationId);
                console.log(designation);

                if (!designation) {
                    results.push({ designationId, message: "Designation not found." });
                    continue;
                }

                const users = await User.find({ designation: designation.designation });

                if (users.length === 0) {
                    results.push({ designationId, message: "No users found for this designation." });
                    continue;
                }

                // Check if assessmentId is an array, and process each assessment individually
                const assessmentIds = Array.isArray(assessmentId) ? assessmentId : [assessmentId];

                for (const user of users) {
                    for (const id of assessmentIds) {
                        user.assignedAssessments.push({
                            assessmentId: id,
                            deadline,
                            status: 'Pending',
                        });

                        await user.save();

                        const assessments = await Assessment.findById(id);
                        console.log(assessments);

                        const answers = assessments.questions.map(question => ({
                            questionId: question._id,
                            correctAnswer: question.correctAnswer,
                            isCorrect: false,
                        }));

                        const newAssessmentProcess = new AssessmentProcess({
                            userId: user._id,
                            assessmentId: id,
                            answers: answers,
                            status: 'Pending',
                        });

                        await newAssessmentProcess.save();

                        results.push({
                            userId: user._id,
                            message: "Assessment assigned successfully.",
                            user,
                            assessmentProcess: newAssessmentProcess,
                        });
                    }
                }
            }
        }

        res.status(200).json({
            message: "Assessment assignment process completed.",
            results,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
};


