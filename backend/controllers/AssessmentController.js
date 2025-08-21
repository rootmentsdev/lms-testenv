import Admin from "../model/Admin.js";
import Assessment from "../model/Assessment.js";
import Branch from "../model/Branch.js";
import Module from "../model/Module.js";
import Notification from "../model/Notification.js";
import TrainingProgress from "../model/Trainingprocessschema.js";
import { Training } from "../model/Traning.js";
import User from "../model/User.js";
import axios from 'axios';

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

// Helper function to fetch employee data from external API
const fetchEmployeeDataForTraining = async () => {
    try {
        const response = await axios.post('https://rootments.in/api/employee_range', {
            startEmpId: 'EMP1',
            endEmpId: 'EMP9999'
        }, { timeout: 15000 });
        
        return response.data?.data || [];
    } catch (error) {
        console.error('Error fetching employee data:', error);
        return [];
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

        // First, fetch external employee data to get the list of employees
        const response = await axios.post('https://rootments.in/api/employee_range', {
            startEmpId: "EMP1",
            endEmpId: "EMP9999"
        });

        if (!response.data || !response.data.data) {
            return res.status(500).json({ message: "Failed to fetch external employee data" });
        }

        const externalEmployees = response.data.data;
        let filteredEmployees = [];

        // Filter external employees based on the selectedOption
        if (selectedOption === 'user') {
            if (!workingBranch || workingBranch.length === 0) {
                return res.status(400).json({ message: "User IDs are required when selectedOption is 'user'" });
            }
            // Filter by employee codes
            filteredEmployees = externalEmployees.filter(emp => 
                workingBranch.includes(emp.emp_code)
            );

        } else if (selectedOption === 'designation') {
            if (!workingBranch || workingBranch.length === 0) {
                return res.status(400).json({ message: "Designation is required when selectedOption is 'designation'" });
            }
            // Filter by role names
            filteredEmployees = externalEmployees.filter(emp => 
                workingBranch.includes(emp.role_name)
            );

        } else if (selectedOption === 'branch') {
            if (!workingBranch || workingBranch.length === 0) {
                return res.status(400).json({ message: "Working branch is required when selectedOption is 'branch'" });
            }
            // Filter by store names
            filteredEmployees = externalEmployees.filter(emp => 
                workingBranch.includes(emp.store_name)
            );

        } else {
            return res.status(400).json({ message: "Invalid selected option" });
        }

        if (filteredEmployees.length === 0) {
            return res.status(404).json({ message: "No employees found matching the criteria from external API" });
        }

        // Now find or create corresponding users in the internal database
        let usersInBranch = [];
        for (const emp of filteredEmployees) {
            if (!emp.emp_code || !emp.email) {
                console.log('Skipping employee with missing emp_code or email:', emp);
                continue;
            }

            // Try to find existing user by empID or email
            let user = await User.findOne({
                $or: [
                    { empID: emp.emp_code },
                    { email: emp.email }
                ]
            });

            if (!user) {
                // Create new user if doesn't exist
                user = new User({
                    username: emp.name || emp.emp_code || 'Unknown',
                    email: emp.email,
                    empID: emp.emp_code,
                    designation: emp.role_name || 'Unknown',
                    locCode: emp.store_name || 'Unknown',
                    workingBranch: emp.store_name || 'Unknown',
                    phoneNumber: emp.phone || '',
                });
                await user.save();
                console.log('Created new user for employee:', emp.emp_code);
            } else {
                // Update existing user with latest info from external API
                user.username = emp.name || user.username;
                user.designation = emp.role_name || user.designation;
                user.locCode = emp.store_name || user.locCode;
                user.workingBranch = emp.store_name || user.workingBranch;
                user.phoneNumber = emp.phone || user.phoneNumber;
                await user.save();
                console.log('Updated existing user for employee:', emp.emp_code);
            }

            usersInBranch.push(user);
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
                   trainingName: trainingName,
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
                averageProgress: parseFloat(averageProgress),
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




        // First, get external employee data to find matching employees
        let externalEmployees = [];
        try {
            const response = await axios.post('https://rootments.in/api/employee_range', {
                startEmpId: "EMP1",
                endEmpId: "EMP9999"
            }, {
                timeout: 10000, // Reduced timeout
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': 'Bearer RootX-production-9d17d9485eb772e79df8564004d4a4d4',
                },
            });
            
            externalEmployees = response.data?.data || [];
            console.log(`Fetched ${externalEmployees.length} external employees`);
        } catch (error) {
            console.error('Error fetching external employee data:', error.message);
            // Continue with internal users only - this is not a critical failure
        }

        const flatten = (str) => str.toLowerCase().replace(/\s+/g, '');

        const matchAnyDesignation = (userDesig, roleList) => {
            if (!userDesig || !Array.isArray(roleList)) return false;
            const flat = flatten(userDesig);
            const flatRoles = roleList.map(role => flatten(role || ''));
            
            // Try exact match first
            if (flatRoles.includes(flat)) return true;
            
            // Try partial matches for common designation variations
            return flatRoles.some(role => {
                // Check if either contains the other (for variations like "Assistant General Manager" vs "AssistantGeneralManager")
                return role.includes(flat) || flat.includes(role) ||
                       // Also check word-by-word matching for cases with different spacing/punctuation
                       role.replace(/[^\w]/g, '').includes(flat.replace(/[^\w]/g, '')) ||
                       flat.replace(/[^\w]/g, '').includes(role.replace(/[^\w]/g, ''));
            });
        };

        console.log('Looking for designations:', workingBranch);
        console.log('Flattened designations:', workingBranch.map(flatten));

        // Get internal users that match the designation
        const allInternalUsers = await User.find();
        console.log(`Found ${allInternalUsers.length} internal users`);
        
        // Log all unique designations from internal users
        const internalDesignations = [...new Set(allInternalUsers.map(u => u.designation))];
        console.log('Internal user designations:', internalDesignations);
        
        const internalUsersInBranch = allInternalUsers.filter(user =>
            matchAnyDesignation(user.designation, workingBranch)
        );
        console.log(`Found ${internalUsersInBranch.length} matching internal users`);

        // Filter external employees by designation and create/find corresponding internal users
        const externalDesignations = [...new Set(externalEmployees.map(emp => emp.role_name).filter(Boolean))];
        console.log('External employee designations:', externalDesignations.slice(0, 10), externalDesignations.length > 10 ? '...' : '');
        
        const matchingExternalEmployees = externalEmployees.filter(emp =>
            matchAnyDesignation(emp.role_name, workingBranch)
        );
        console.log(`Found ${matchingExternalEmployees.length} matching external employees`);

        // Create or find internal users for matching external employees
        const externalToInternalUsers = [];
        for (const emp of matchingExternalEmployees) {
            if (!emp.emp_code || !emp.email) {
                continue;
            }

            // Try to find existing user
            let user = await User.findOne({
                $or: [
                    { empID: emp.emp_code },
                    { email: emp.email }
                ]
            });

            if (!user) {
                // Create new user if doesn't exist
                try {
                    user = new User({
                        username: emp.name || emp.emp_code || 'Unknown',
                        email: emp.email,
                        empID: emp.emp_code,
                        locCode: emp.store_code || 'DEFAULT',
                        designation: emp.role_name || '',
                        workingBranch: emp.store_name || 'DEFAULT',
                    });
                    await user.save();
                    console.log(`Created new user: ${user.username} with designation: ${user.designation}`);
                } catch (saveError) {
                    console.error(`Failed to create user for ${emp.emp_code}:`, saveError.message);
                    continue;
                }
            }
            externalToInternalUsers.push(user);
        }

        // Combine internal and external-derived users
        const usersInBranch = [...internalUsersInBranch, ...externalToInternalUsers];

        // Remove duplicates based on empID
        const uniqueUsersMap = new Map();
        usersInBranch.forEach(user => {
            if (!uniqueUsersMap.has(user.empID)) {
                uniqueUsersMap.set(user.empID, user);
            }
        });
        const finalUsersInBranch = Array.from(uniqueUsersMap.values());

        if (finalUsersInBranch.length === 0) {
            // Last resort: Try to find any external employees with matching designations and create users for them
            const lastResortMatches = externalEmployees.filter(emp => {
                if (!emp.role_name || !emp.emp_code || !emp.email) return false;
                return workingBranch.some(designation => {
                    const empRole = flatten(emp.role_name);
                    const targetRole = flatten(designation);
                    // Very flexible matching for last resort
                    return empRole.includes(targetRole) || targetRole.includes(empRole) ||
                           empRole.replace(/[^\w]/g, '') === targetRole.replace(/[^\w]/g, '');
                });
            });
            
            console.log(`Last resort: Found ${lastResortMatches.length} potential matches`);
            
            // Create users for last resort matches
            const lastResortUsers = [];
            for (const emp of lastResortMatches.slice(0, 50)) { // Limit to 50 to avoid overwhelming
                try {
                    // Check if user already exists
                    const existingUser = await User.findOne({
                        $or: [
                            { empID: emp.emp_code },
                            { email: emp.email }
                        ]
                    });
                    
                    if (!existingUser) {
                        const newUser = new User({
                            username: emp.name || emp.emp_code || 'Unknown',
                            email: emp.email,
                            empID: emp.emp_code,
                            locCode: emp.store_code || 'DEFAULT',
                            designation: emp.role_name || '',
                            workingBranch: emp.store_name || 'DEFAULT',
                        });
                        await newUser.save();
                        lastResortUsers.push(newUser);
                        console.log(`Created user: ${newUser.username} with designation: ${newUser.designation}`);
                    } else {
                        lastResortUsers.push(existingUser);
                    }
                } catch (createError) {
                    console.error(`Failed to create user for ${emp.emp_code}:`, createError.message);
                }
            }
            
            if (lastResortUsers.length > 0) {
                console.log(`Successfully created/found ${lastResortUsers.length} users for training assignment`);
                // Continue with the training assignment for these users
                finalUsersInBranch.push(...lastResortUsers);
            } else {
                // Provide more helpful error information
                const availableDesignations = [
                    ...new Set([
                        ...internalDesignations,
                        ...externalDesignations.slice(0, 20) // Limit to first 20 to avoid too long message
                    ])
                ].sort();
                
                return res.status(404).json({ 
                    message: `No users found for the provided designation(s): ${workingBranch.join(', ')}. Please check if the designation names match exactly.`,
                    debug: {
                        searchedDesignations: workingBranch,
                        internalUsersFound: allInternalUsers.length,
                        externalEmployeesFound: externalEmployees.length,
                        availableDesignations: availableDesignations.slice(0, 10),
                        totalAvailableDesignations: availableDesignations.length,
                        lastResortAttempted: lastResortMatches.length
                    }
                });
            }
        }


        // Assign training and create progress for each user
        const updatedUsers = finalUsersInBranch.map(async (user) => {
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
                  trainingName: trainingName,
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
            message: `Training created and assigned successfully to ${finalUsersInBranch.length} users`,
            training: newTraining,
            assignedUsersCount: finalUsersInBranch.length
        });
        const newNotification = await Notification.create({
            title: `New training Created : ${trainingName}`,
            body: `${trainingName} has been successfully created and assigned to ${finalUsersInBranch.length} users. Created by ${admin?.name}. The training is scheduled to be completed in ${days} days.`,
            Role: workingBranch,
            useradmin: admin?.name, // Optional
        });
    } catch (error) {
        console.error("Error creating training:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
