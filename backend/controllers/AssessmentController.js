import Admin from "../model/Admin.js";
import Assessment from "../model/Assessment.js";
import Branch from "../model/Branch.js";
import Module from "../model/Module.js";
import Notification from "../model/Notification.js";
import TrainingProgress from "../model/Trainingprocessschema.js";
import { Training } from "../model/Traning.js";
import User from "../model/User.js";

export const createAssessment = async (req, res) => {
    try {
        const assessmentData = req.body;

        // Validate input
        if (!assessmentData.title || !assessmentData.duration || !Array.isArray(assessmentData.questions) || !assessmentData.deadline) {
            return res.status(400).json({ message: "Invalid assessment data. Ensure all required fields are present." });
        }

        const admin = await Admin.findById(req?.admin?.userId)


        // Create and save the assessment
        const newAssessment = new Assessment(assessmentData);
        await newAssessment.save();

        const newNotification = await Notification.create({
            title: `New AssessmentData Created : ${assessmentData.title}`,
            body: `${assessmentData.title} has been successfully created. Created by ${admin?.name}. Ready for user assignment`,
            category: "Assessment",
            useradmin: admin?.name, // Optional
        });
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
    const AdminID = req.admin.userId;
    const AdminData = await Admin.findById(AdminID).populate("permissions");

    if (!AdminData || !AdminData.permissions.length) {
        return res.status(403).json({
            message: "No permissions found for this admin",
        });
    }

    // Extract first permission object
    const adminPermissions = AdminData.permissions[0];

    if (!AdminData.permissions[0].permissions.canCreateTraining) {
        return res.status(401).json({
            message: "You have no permission",
        });
    }

    console.log(AdminData);


    console.log(req.admin);
    const admin = await Admin.findById(req?.admin?.userId)
    console.log(admin);

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
           // abhiram change
const normalizeRegex = (str) => str
  .toLowerCase()
  .replace(/\s+/g, '')             // Remove all whitespace first
  .split('')
  .map(ch => `\\s*${ch}`)          // Allow optional whitespace before each character
  .join('') + '\\s*';              // Allow optional trailing whitespace

usersInBranch = await User.find({
  designation: {
    $regex: `^${normalizeRegex(workingBranch)}$`,
    $options: 'i'
  }
});



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

        if (selectedOption === 'user') {
            if (!workingBranch || workingBranch.length === 0) {
                return res.status(400).json({ message: "User IDs are required when selectedOption is 'user'" });
            }

            // Create notification for users
            const newNotification = await Notification.create({
                title: `New training Created : ${trainingName}`,
                body: `${trainingName} has been successfully created. Created by ${admin?.name}. The training is scheduled to be completed in ${days} days.`,
                user: workingBranch,  // Pass workingBranch array here
                useradmin: admin?.name,  // Optional
            });

        } else if (selectedOption === 'designation') {
            if (!workingBranch) {
                return res.status(400).json({ message: "Designation is required when selectedOption is 'designation'" });
            }

            // Create notification for Role
            const newNotification = await Notification.create({
                title: `New training Created : ${trainingName}`,
                body: `${trainingName} has been successfully created. Created by ${admin?.name}. The training is scheduled to be completed in ${days} days.`,
                Role: workingBranch,  // Pass the designation here
                useradmin: admin?.name,  // Optional
            });

        } else if (selectedOption === 'branch') {
            if (!workingBranch) {
                return res.status(400).json({ message: "Working branch is required when selectedOption is 'branch'" });
            }

            // Create notification for branch
            const newNotification = await Notification.create({
                title: `New training Created : ${trainingName}`,
                body: `${trainingName} has been successfully created. Created by ${admin?.name}. The training is scheduled to be completed in ${days} days.`,
                branch: workingBranch,  // Pass the branch here
                useradmin: admin?.name,  // Optional
            });
        }


        res.status(201).json({ message: "Training created and assigned successfully", training: newTraining });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const GetTrainingById = async (req, res) => {
    const { id } = req.params; // Extract the training ID from request params
    console.log(id);


    try {
        // Fetch training data and populate modules
        const training = await Training.findById(id).populate({
            path: 'modules',
            model: 'Module',
        });

        if (!training) {
            return res.status(404).json({ message: 'Training not found' });
        }

        // Fetch all user progress records tied to this training
        const progressRecords = await TrainingProgress.find({ trainingId: id });



        // Ensure module-level tracking is initialized
        const moduleCompletionStats = training.modules.map((module) => ({
            moduleId: module._id,
            totalUsers: 0,
            completedByUsers: 0,
        }));

        // Calculate user progress
        const userProgress = progressRecords.map((record) => {
            let totalVideos = 0;
            let completedVideos = 0;

            // Process each module's progress
            const modulesProgress = record.modules.map((module) => {
                const totalVideosInModule = module.videos.length;
                const completedVideosInModule = module.videos.filter((v) => v.pass).length;

                totalVideos += totalVideosInModule;
                completedVideos += completedVideosInModule;

                // Update module-level stats
                const moduleStat = moduleCompletionStats.find((stat) => stat.moduleId.equals(module.moduleId));
                if (moduleStat) {
                    moduleStat.totalUsers += 1;
                    if (module.pass) {
                        moduleStat.completedByUsers += 1;
                    }
                }

                // Return module progress
                return {
                    moduleId: module.moduleId,
                    pass: module.pass,
                    videosCompleted: completedVideosInModule,
                    totalVideos: totalVideosInModule,
                    completionPercentage: totalVideosInModule > 0
                        ? ((completedVideosInModule / totalVideosInModule) * 100).toFixed(2)
                        : 0,
                };
            });

            // Calculate overall progress for the user
            const overallCompletionPercentage = totalVideos > 0
                ? ((completedVideos / totalVideos) * 100).toFixed(2)
                : 0;

            return {
                userId: record.userId,
                pass: record.pass,
                status: record.status,
                modules: modulesProgress,
                overallCompletionPercentage,
            };
        });
        // console.log(userProgress);


        // Calculate average module completion percentages
        const averageCompletedModule = moduleCompletionStats.map((moduleStat) => ({
            moduleId: moduleStat.moduleId,
            completionPercentage: moduleStat.totalUsers > 0
                ? ((moduleStat.completedByUsers / moduleStat.totalUsers) * 100).toFixed(2)
                : 0,
        }));
        // console.log(averageCompletedModule);


        // Calculate average overall user progress
        const totalProgress = userProgress.reduce((sum, user) => sum + parseFloat(user.overallCompletionPercentage), 0);
        const averageCompletionPercentage = userProgress.length > 0
            ? (totalProgress / userProgress.length).toFixed(2)
            : 0;
        console.log(averageCompletionPercentage);

        // Send response
        res.status(200).json({
            message: 'Training data retrieved successfully',
            data: {
                ...training._doc,
                averageCompletedModule,
            },
            users: userProgress,
            averageCompletionPercentage,
        });

    } catch (error) {
        console.error('Error fetching training by ID:', error);
        res.status(500).json({ message: 'Server error while fetching training data', error: error.message });
    }
};



export const calculateProgress = async (req, res) => {
    try {
        const AdminID = req.admin.userId;
        const AdminData = await Admin.findById(AdminID).populate('branches');
        const allowedLocCodes = AdminData.branches.map(branch => branch.locCode);
        const day = new Date();

        // Count documents
        const assessmentCount = await Assessment.countDocuments();
        const userCount = await User.find({ locCode: { $in: allowedLocCodes } });
        console.log(allowedLocCodes);

        // Fetch users once instead of multiple times
        const users = await User.find({ locCode: { $in: allowedLocCodes } });
        const userID = users.map(id => id._id)

        // Fetch all trainings
        const trainings = await TrainingProgress.find({ userId: { $in: userID } });

        // Calculate completion percentage for each training
        const progressArray = trainings.map((training) => {
            if (!training.modules || !Array.isArray(training.modules)) return 0;

            const totalModules = training.modules.length;
            const completedModules = training.modules.reduce((count, module) => {
                const totalVideos = module.videos?.length || 0;
                const completedVideos = module.videos?.filter(video => video.pass).length || 0;
                return count + (module.pass && completedVideos === totalVideos ? 1 : 0);
            }, 0);

            return totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
        });

        // Calculate overall average progress
        const averageProgress = progressArray.length
            ? (progressArray.reduce((a, b) => a + b, 0) / progressArray.length).toFixed(2)
            : "0.00";

        // Calculate assessment progress
        let totalAssessments = 0;
        let passedAssessments = 0;
        let trainingpend = 0;

        users.forEach(user => {
            if (Array.isArray(user.assignedAssessments)) {
                totalAssessments += user.assignedAssessments.length;
                passedAssessments += user.assignedAssessments.filter(
                    item => day > item.deadline && item.pass === false
                ).length;
            }

            if (Array.isArray(user.training)) {
                trainingpend += user.training.filter(
                    item => day > item.deadline && item.pass === false
                ).length;
            }
        });



        // Return results
        res.status(200).json({
            success: true,
            data: {
                assessmentCount,
                branchCount: AdminData.branches.length,
                userCount: userCount.length,
                averageProgress,
                assessmentProgress: passedAssessments,
                trainingPending: trainingpend
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



export const createMandatoryTraining = async (req, res) => {
    const { trainingName, modules, days, workingBranch } = req.body;

    const admin = await Admin.findById(req?.admin?.userId)


    try {
        // Validate required fields
        if (!trainingName || !modules || !days || !workingBranch) {
            return res.status(400).json({ message: "Training name, modules, days, and working branch are required" });
        }

        // Fetch module details from Module collection
        const moduleDetails = await Module.find({ _id: { $in: modules } }).populate('videos');

        if (moduleDetails.length === 0) {
            return res.status(404).json({ message: "Modules not found" });
        }

        // Calculate deadline as a Date
        const deadlineDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

        // Create new training with updated fields
        const newTraining = new Training({
            trainingName,
            Trainingtype: "Mandatory", // Correct field for training type
            modules,
            Assignedfor: workingBranch, // Correct field for assigned branches
            deadline: days, // Store deadline as a proper Date
        });

        // Save the training record
        await newTraining.save();

        //         // Find users based on designation/branch  abhiram chnage
        //         const usersInBranch = await User.find({
        //   $or: workingBranch.map(role => ({
        //     designation: { $regex: `^${role}$`, $options: 'i' }
        //   }))
        // });

        // // Helper function to create flexible regex
        // const normalizeRegex = (str) => str.toLowerCase().replace(/\s+/g, '').split('').join('\\s*');

        // // Updated line for finding users by designation
        // const usersInBranch = await User.find({
        //     $or: workingBranch.map(role => ({
        //         designation: {
        //             $regex: `^${normalizeRegex(role)}$`,
        //             $options: 'i'
        //         }
        //     }))
        // });




        const flatten = (str) => str.toLowerCase().replace(/\s+/g, '');

        const matchAnyDesignation = (userDesig, roleList) => {
            const flat = flatten(userDesig);
            return roleList.map(flatten).includes(flat);
        };

        const allUsers = await User.find(); // Optionally add filters like { locCode: "XYZ" }

        const usersInBranch = allUsers.filter(user =>
            matchAnyDesignation(user.designation, workingBranch)
        );




        if (usersInBranch.length === 0) {
            return res.status(404).json({ message: "No users found matching the criteria" });
        }


        // Assign training and create progress for each user
        const updatedUsers = usersInBranch.map(async (user) => {
            user.training.push({
                trainingId: newTraining._id,
                deadline: deadlineDate,
                pass: false,
                status: 'Pending',
            });

            // Create training progress
            const trainingProgress = new TrainingProgress({
                userId: user._id,
                trainingId: newTraining._id,
                deadline: deadlineDate,
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

        await Promise.all(updatedUsers); // Save all users asynchronously

        res.status(201).json({
            message: "Training created and assigned successfully",
            training: newTraining,
        });
        const newNotification = await Notification.create({
            title: `New training Created : ${trainingName}`,
            body: `${trainingName} has been successfully created. Created by ${admin?.name}. The training is scheduled to be completed in ${days} days.`,
            Role: workingBranch,

            useradmin: admin?.name, // Optional
        });
    } catch (error) {
        console.error("Error creating training:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

