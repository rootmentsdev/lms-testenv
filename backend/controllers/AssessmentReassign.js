import Admin from "../model/Admin.js";
import Assessment from "../model/Assessment.js";
import AssessmentProcess from "../model/Assessmentprocessschema.js";
import Designation from "../model/designation.js";
import Notification from "../model/Notification.js";
import TrainingProgress from "../model/Trainingprocessschema.js";
import { Training } from "../model/Traning.js";
import User from "../model/User.js";

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
        const { assessmentId, assignedTo, days, selectedOption, Reassign } = req.body;
        console.log(assessmentId, assignedTo, days, selectedOption, Reassign);

        const AdminID = req.admin.userId;
        const AdminData = await Admin.findById(AdminID).populate("permissions");

        if (!AdminData || !AdminData.permissions.length) {
            return res.status(403).json({
                message: "No permissions found for this admin",
            });
        }
        // console.log();


        // Extract first permission object
        const adminPermissions = AdminData.permissions[0];

        if (!AdminData.permissions[0].permissions.canCreateAssessment) {
            return res.status(401).json({
                message: "You have no permission",
            });
        }
        // Validate input
        if (!assessmentId || !assignedTo || !Array.isArray(assignedTo) || assignedTo.length === 0 || !days) {
            return res.status(400).json({ message: "All fields are required and 'assignedTo' must be a non-empty array." });
        }

        // Calculate deadline
        const deadline = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

        const results = [];

        // Process assignments based on the selected option
        if (selectedOption === 'user') {
            for (const userId of assignedTo) {
                const user = await User.findById(userId);

                if (!user) {
                    results.push({ userId, message: "User not found." });
                    continue;
                }

                const assessmentIds = Array.isArray(assessmentId) ? assessmentId : [assessmentId];

                for (const id of assessmentIds) {
                    const alreadyAssigned = user.assignedAssessments.some(
                        (assessment) => assessment.assessmentId.toString() === id.toString()
                    );

                    if (Reassign) {
                        // Remove existing assignment if reassignment is enabled
                        if (alreadyAssigned) {
                            user.assignedAssessments = user.assignedAssessments.filter(
                                (assessment) => assessment.assessmentId.toString() !== id.toString()
                            );
                            await user.save();

                            await AssessmentProcess.deleteOne({ userId: user._id, assessmentId: id });

                            results.push({
                                userId,
                                assessmentId: id,
                                message: "Old assessment removed and reassigned.",
                            });
                        }
                    } else if (alreadyAssigned) {
                        // Skip assignment if reassignment is disabled and already assigned
                        results.push({
                            userId,
                            assessmentId: id,
                            message: "Assessment already assigned and Reassign is disabled.",
                        });
                        continue;
                    }

                    // Assign the new assessment
                    user.assignedAssessments.push({
                        assessmentId: id,
                        deadline,
                        status: 'Pending',
                    });

                    await user.save();

                    const assessment = await Assessment.findById(id);
                    if (!assessment) {
                        results.push({ userId, assessmentId: id, message: "Assessment not found." });
                        continue;
                    }

                    const answers = assessment.questions.map((question) => ({
                        questionId: question._id,
                        correctAnswer: question.correctAnswer,
                        isCorrect: false,
                    }));

                    const newAssessmentProcess = new AssessmentProcess({
                        userId,
                        assessmentId: id,
                        answers,
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
            for (const locCode of assignedTo) {
                const users = await User.find({ locCode });
                if (users.length === 0) {
                    results.push({ locCode, message: "No users found for this location." });
                    continue;
                }

                const assessmentIds = Array.isArray(assessmentId) ? assessmentId : [assessmentId];

                for (const user of users) {
                    for (const id of assessmentIds) {
                        const alreadyAssigned = user.assignedAssessments.some(
                            (assessment) => assessment.assessmentId.toString() === id.toString()
                        );

                        if (Reassign) {
                            if (alreadyAssigned) {
                                user.assignedAssessments = user.assignedAssessments.filter(
                                    (assessment) => assessment.assessmentId.toString() !== id.toString()
                                );
                                await user.save();

                                await AssessmentProcess.deleteOne({ userId: user._id, assessmentId: id });

                                results.push({
                                    userId: user._id,
                                    assessmentId: id,
                                    message: "Old assessment removed and reassigned.",
                                });
                            }
                        } else if (alreadyAssigned) {
                            results.push({
                                userId: user._id,
                                assessmentId: id,
                                message: "Assessment already assigned and Reassign is disabled.",
                            });
                            continue;
                        }

                        user.assignedAssessments.push({
                            assessmentId: id,
                            deadline,
                            status: 'Pending',
                        });

                        await user.save();

                        const assessment = await Assessment.findById(id);
                        if (!assessment) {
                            results.push({ userId: user._id, assessmentId: id, message: "Assessment not found." });
                            continue;
                        }

                        const answers = assessment.questions.map((question) => ({
                            questionId: question._id,
                            correctAnswer: question.correctAnswer,
                            isCorrect: false,
                        }));

                        const newAssessmentProcess = new AssessmentProcess({
                            userId: user._id,
                            assessmentId: id,
                            answers,
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
            for (const designationId of assignedTo) {
                const designation = await Designation.findById(designationId);
                if (!designation) {
                    results.push({ designationId, message: "Designation not found." });
                    continue;
                }

                const users = await User.find({ designation: designation.designation });
                if (users.length === 0) {
                    results.push({ designationId, message: "No users found for this designation." });
                    continue;
                }

                const assessmentIds = Array.isArray(assessmentId) ? assessmentId : [assessmentId];

                for (const user of users) {
                    for (const id of assessmentIds) {
                        const alreadyAssigned = user.assignedAssessments.some(
                            (assessment) => assessment.assessmentId.toString() === id.toString()
                        );

                        if (Reassign) {
                            if (alreadyAssigned) {
                                user.assignedAssessments = user.assignedAssessments.filter(
                                    (assessment) => assessment.assessmentId.toString() !== id.toString()
                                );
                                await user.save();

                                await AssessmentProcess.deleteOne({ userId: user._id, assessmentId: id });

                                results.push({
                                    userId: user._id,
                                    assessmentId: id,
                                    message: "Old assessment removed and reassigned.",
                                });
                            }
                        } else if (alreadyAssigned) {
                            results.push({
                                userId: user._id,
                                assessmentId: id,
                                message: "Assessment already assigned and Reassign is disabled.",
                            });
                            continue;
                        }

                        user.assignedAssessments.push({
                            assessmentId: id,
                            deadline,
                            status: 'Pending',
                        });

                        await user.save();

                        const assessment = await Assessment.findById(id);
                        if (!assessment) {
                            results.push({ userId: user._id, assessmentId: id, message: "Assessment not found." });
                            continue;
                        }

                        const answers = assessment.questions.map((question) => ({
                            questionId: question._id,
                            correctAnswer: question.correctAnswer,
                            isCorrect: false,
                        }));

                        const newAssessmentProcess = new AssessmentProcess({
                            userId: user._id,
                            assessmentId: id,
                            answers,
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


export const FindOverDueAssessment = async (req, res) => {
    try {
        const AdminId = req.admin?.userId;
        if (!AdminId) {
            return res.status(400).json({ message: "Admin ID not found" });
        }

        const AdminBranch = await Admin.findById(AdminId).populate('branches').lean();
        if (!AdminBranch || !AdminBranch.branches) {
            return res.status(404).json({ message: "Admin branches not found" });
        }

        const allowedLocCodes = AdminBranch.branches.map(branch => branch.locCode);
        const currentDate = new Date(); // Standardized for comparison

        const DueAssessment = await User.find({
            locCode: { $in: allowedLocCodes },
            assignedAssessments: {
                $elemMatch: {
                    pass: false,
                    deadline: { $lt: currentDate } // Proper date comparison
                }
            }
        })
            .populate("assignedAssessments.assessmentId")
            .select("name email empID username designation workingBranch assignedAssessments")
            .lean(); // Improve performance

        if (!DueAssessment || DueAssessment.length === 0) {
            return res.status(204).json({ message: "No overdue assessments found" });
        }

        // Filter overdue assessments
        const filterData = DueAssessment.map(user => ({
            userId: user._id,
            empID: user.empID || "N/A",
            userName: user.username || user.name || "Unknown", // Fallback name
            role: user.designation || "Not Specified",
            workingBranch: user.workingBranch || "N/A",
            overdueAssessments: user.assignedAssessments.filter(
                (item) => item.pass === false && new Date(item.deadline) < currentDate
            )
        })).filter(user => user.overdueAssessments.length > 0);

        if (filterData.length === 0) {
            return res.status(204).json({ message: "No overdue assessments found" });
        }

        res.status(200).json({
            message: "Overdue assessments found",
            data: filterData
        });

    } catch (error) {
        console.error("Error finding overdue assessments:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const FindOverDueTraining = async (req, res) => {
    try {
        const AdminId = req.admin?.userId;
        if (!AdminId) {
            return res.status(400).json({ message: "Admin ID not found" });
        }
        console.log("ADMIN ID ID " + AdminId);


        // Find admin and get branches
        const AdminBranch = await Admin.findById(AdminId).populate('branches').lean();
        if (!AdminBranch || !AdminBranch.branches) {
            return res.status(404).json({ message: "Admin branches not found" });
        }
        console.log(AdminBranch);


        const allowedLocCodes = AdminBranch.branches.map(branch => branch.locCode);
        const currentDate = new Date(); // Get current date

        // Find users with overdue training assessments
        const DueAssessment = await User.find({
            locCode: { $in: allowedLocCodes },
            training: {
                $elemMatch: {
                    pass: false,
                    deadline: { $lt: currentDate } // Deadline is in the past
                }
            }
        }).populate("training.trainingId").lean();

        if (!DueAssessment || DueAssessment.length === 0) {
            return res.status(200).json({
                message: "No overdue assessments found",
                data: []
            });
        }

        // Filter overdue assessments for each user
        const filterData = DueAssessment.map((user) => ({
            userId: user._id,
            empID: user.empID,
            userName: user.username,
            role: user.designation,
            workingBranch: user.workingBranch,
            overdueAssessments: user.training.filter(
                (item) => item.pass === false && item.deadline < currentDate
            )
        })).filter(user => user.overdueAssessments.length > 0);

        if (filterData.length === 0) {
            return res.status(200).json({
                message: "No overdue assessments found",
                data: []
            });
        }

        return res.status(200).json({
            message: "Overdue assessments found",
            data: filterData
        });

    } catch (error) {
        console.error("Error finding overdue assessments:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

export const SendNotification = async (req, res) => {
    try {
        const { empId } = req.params;
        console.log("Employee ID:", empId);

        const admin = req.admin;
        console.log("Admin:", admin);

        const day = new Date(); // Current date

        // Find the user with overdue assessments
        const DueAssessment = await User.findOne({
            empID: empId,
            training: {
                $elemMatch: {
                    pass: false, // Condition: pass is false
                    deadline: { $lt: day }, // Condition: deadline is in the past
                },
            },
        }).populate("training.trainingId");

        if (!DueAssessment) {
            return res.status(400).json({
                message: "No due assessments found for this employee.",
            });
        }

        // Filter overdue assessments
        const overdueAssessments = DueAssessment.training.filter(
            (item) => item.pass === false && item.deadline < day
        );

        if (overdueAssessments.length === 0) {
            return res.status(400).json({
                message: "No overdue assessments found for this employee.",
            });
        }

        // Extract training names
        const trainingNames = overdueAssessments.map(
            (assessment) => assessment.trainingId?.trainingName || "Unnamed Training"
        );

        // Create a notification
        await Notification.create({
            title: `${DueAssessment.username} has overdue training tasks`,
            body: `You need to complete ${trainingNames.length} training tasks: ${trainingNames.join(
                ", "
            )}. Notification sent by ${admin.username}.`,
            user: DueAssessment._id,
            useradmin: admin.username,
        });

        // Response
        res.status(200).json({
            message: `Notification sent successfully to ${DueAssessment.username}`,
            overdueTrainings: trainingNames,
        });
    } catch (error) {
        console.error("Error finding overdue assessments:", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const SendNotificationAssessment = async (req, res) => {
    try {
        const { empId } = req.params;
        console.log("Employee ID:", empId);

        const admin = req.admin;
        console.log("Admin:", admin);

        const day = new Date(); // Current date

        // Find the user with overdue assessments
        const DueAssessment = await User.findOne({
            empID: empId,
            assignedAssessments: {
                $elemMatch: {
                    pass: false, // Condition: pass is false
                    deadline: { $lt: day }, // Condition: deadline is in the past
                },
            },
        }).populate("assignedAssessments.assessmentId");

        if (!DueAssessment) {
            return res.status(400).json({
                message: "No due assessments found for this employee.",
            });
        }

        // Filter overdue assessments
        const overdueAssessments = DueAssessment.assignedAssessments.filter(
            (item) => item.pass === false && item.deadline < day
        );

        if (overdueAssessments.length === 0) {
            return res.status(400).json({
                message: "No overdue assessments found for this employee.",
            });
        }

        // Extract training names
        const trainingNames = overdueAssessments.map(
            (assessment) => assessment.assessmentId?.title || "Unnamed Training"
        );

        // Create a notification
        await Notification.create({
            title: `${DueAssessment.username} has overdue Assessment tasks`,
            body: `You need to complete ${trainingNames.length} Assessment tasks: ${trainingNames.join(
                ", "
            )}. Notification sent by ${admin.username}.`,
            user: DueAssessment._id,
            useradmin: admin.username,
            category: "Assessment"
        });

        // Response
        res.status(200).json({
            message: `Notification sent successfully to ${DueAssessment.username}`,
            overdueTrainings: trainingNames,
        });
    } catch (error) {
        console.error("Error finding overdue assessments:", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};


export const CreateNotification = async (req, res) => {
    try {
        const { deliveryMethod, message, recipient, role, title } = req.body;

        // Log the received data for debugging
        console.log({ deliveryMethod, message, recipient, role, title });

        // Validate required fields
        if (!deliveryMethod || !message || !recipient || !role || !title) {
            return res.status(400).json({
                message: "All fields are required.",
            });
        }

        // Define admin (example: fetching admin from req.user)
        const admin = req.user || { username: "Admin" };

        // Prepare the base notification object
        const notificationData = {
            title: title,
            body: message,
            useradmin: admin.username,
            category: "Created",
        };

        // Dynamically assign the correct field based on the role
        if (role === "branch") {
            notificationData.branch = recipient; // Assign to branch
        } else if (role === "user") {
            notificationData.user = recipient; // Assign to user
        } else {
            notificationData.Role = recipient; // Assign to custom role
        }

        // Create the notification
        const notification = await Notification.create(notificationData);

        // Respond with success
        return res.status(201).json({
            message: "Notification created successfully.",
            notification,
        });
    } catch (error) {
        console.error("Error creating notification:", error.message);
        return res.status(500).json({
            message: "Internal server error.",
            error: error.message,
        });
    }
};
