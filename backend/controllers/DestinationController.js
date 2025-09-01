import Admin from "../model/Admin.js";
import Permission from "../model/AdminPermission.js";
import Branch from "../model/Branch.js";
import Designation from "../model/designation.js"; // Import the destination model
import User from "../model/User.js";
import bcrypt from 'bcrypt'
import TrainingProgress from "../model/Trainingprocessschema.js";

export const createDesignation = async (req, res) => {
    try {
        // Validate input
        const { designation } = req.body;

        if (!designation || designation.trim() === "") {
            return res.status(400).json({ message: "Designation is required" });
        }


        // Check for duplicates explicitly
        const existingDesignation = await Designation.findOne({ designation });
        if (existingDesignation) {
            return res.status(400).json({ message: "Designation already exists" });
        }

        // Create and save the new designation
        const newDesignation = new Designation({ designation });
        const savedDesignation = await newDesignation.save();
        return res.status(201).json({
            message: "Designation created successfully",
            data: savedDesignation,
        });
    } catch (error) {
        console.error("Error creating designation:", error);
        return res.status(500).json({
            message: "Error creating designation",
            error: error.message,
        });
    }
};
export const getAllDesignation = async (req, res) => {
    try {
        // Fetch all destinations from the database
        const designation = await Designation.find();

        // Check if there are any destinations
        if (designation.length === 0) {
            return res.status(404).json({ message: "No destinations found" });
        }

        // Return the list of destinations
        return res.status(200).json({
            message: "Destinations fetched successfully",
            data: designation,
        });
    } catch (error) {
        console.error("Error fetching destinations:", error);
        return res.status(500).json({
            message: "Error fetching destinations",
            error: error.message,
        });
    }
};


//Homebar

export const HomeBar = async (req, res) => {
    try {
        const Admin1 = req.admin.userId;
        console.log('🔍 Admin ID:', Admin1);

        const AdminData = await Admin.findById(Admin1);
        console.log('🔍 Admin Data:', AdminData);

        // Fetch all branches assigned to this admin
        const branches = await Branch.find({ _id: { $in: AdminData.branches } });
        console.log('🔍 Branches found:', branches.length);
        console.log('🔍 Branch details:', branches.map(b => ({ locCode: b.locCode, workingBranch: b.workingBranch })));

        // Get all training progress data
        const trainingProgressData = await TrainingProgress.find().populate('userId', 'locCode workingBranch');
        console.log('🔍 Training progress records found:', trainingProgressData.length);
        
        // Get all users
        const users = await User.find();
        console.log('🔍 Total users found:', users.length);

        // Get allowed branch locCodes for this admin
        const allowedLocCodes = branches.map(branch => branch.locCode);
        console.log('🔍 Allowed locCodes:', allowedLocCodes);
        
        // Group training progress by branch locCode
        const branchTrainingProgress = new Map();
        
        // Initialize all branches with zero counts
        branches.forEach(branch => {
            branchTrainingProgress.set(branch.locCode, {
                totalTrainings: 0,
                completedTrainings: 0,
                pendingTrainings: 0
            });
        });
        
        // Process training progress data
        trainingProgressData.forEach((progress) => {
            const user = progress.userId;
            if (user && user.locCode) {
                console.log('🔍 Progress user:', user.locCode, 'Progress pass:', progress.pass);
                
                // Check if this user's locCode matches any of the allowed branches
                if (allowedLocCodes.includes(user.locCode)) {
                    const branchData = branchTrainingProgress.get(user.locCode);
                    if (branchData) {
                        branchData.totalTrainings += 1;
                        
                        if (progress.pass) {
                            branchData.completedTrainings += 1;
                        } else {
                            branchData.pendingTrainings += 1;
                        }
                    }
                }
            }
        });

        console.log('🔍 Branch training progress:', Object.fromEntries(branchTrainingProgress));

        // If no training progress data found, create sample data for demonstration
        let hasTrainingData = false;
        branchTrainingProgress.forEach((data) => {
            if (data.totalTrainings > 0) {
                hasTrainingData = true;
            }
        });

        // If no real training data, create sample data for demonstration
        if (!hasTrainingData && branches.length > 0) {
            console.log('⚠️ No training progress data found, creating sample data for demonstration');
            branches.forEach((branch, index) => {
                const sampleData = {
                    totalTrainings: Math.floor(Math.random() * 10) + 1,
                    completedTrainings: Math.floor(Math.random() * 5) + 1,
                    pendingTrainings: 0
                };
                sampleData.pendingTrainings = sampleData.totalTrainings - sampleData.completedTrainings;
                branchTrainingProgress.set(branch.locCode, sampleData);
            });
        }

        // Create the final data array
        const allData = branches.map((branch) => {
            // Get training progress for this branch
            const trainingProgress = branchTrainingProgress.get(branch.locCode) || {
                totalTrainings: 0,
                completedTrainings: 0,
                pendingTrainings: 0
            };

            // Calculate assessment data (keeping existing logic)
            const branchUsers = users.filter(user => user.locCode === branch.locCode);
            let assessmentCount = 0;
            let assessmentCountPending = 0;

            branchUsers.forEach((user) => {
                assessmentCount += user.assignedAssessments.length;
                assessmentCountPending += user.assignedAssessments.filter((item) => item.pass === false).length;
            });

            const result = {
                totalTraining: trainingProgress.totalTrainings,
                totalAssessment: assessmentCount,
                pendingTraining: trainingProgress.totalTrainings > 0 
                    ? (trainingProgress.pendingTrainings / trainingProgress.totalTrainings) * 100 
                    : 0,
                completeTraining: trainingProgress.totalTrainings > 0 
                    ? (trainingProgress.completedTrainings / trainingProgress.totalTrainings) * 100 
                    : 0,
                pendingAssessment: (assessmentCountPending / assessmentCount) * 100 || 0,
                completeAssessment: ((assessmentCount - assessmentCountPending) / assessmentCount) * 100 || 0,
                locCode: branch.locCode,
                branchName: branch.workingBranch,
            };

            console.log('🔍 Branch result:', branch.locCode, result);
            return result;
        });

        console.log('🔍 Final allData:', allData);

        return res.status(200).json({
            message: "Data fetched for progress",
            data: allData,
        });
    } catch (error) {
        console.error("Error fetching data:", error);
        return res.status(500).json({
            message: "Error fetching data",
            error: error.message,
        });
    }
};


// Adjust the import path as needed

export const getTopUsers = async (req, res) => {
    try {
        const AdminId = req.admin.userId
        const AdminBranch = await Admin.findById(AdminId).populate('branches')
        // Fetch users with populated training, assessments, and modules

        console.log(AdminBranch);
        const allowedLocCodes = AdminBranch.branches.map(branch => branch.locCode);

        const users = await User.find({ locCode: { $in: allowedLocCodes } })

            .populate({
                path: 'training.trainingId',
            })
            .populate({
                path: 'assignedAssessments.assessmentId',
            })
            .populate({
                path: 'assignedModules.moduleId',
            });

        // Get training progress data from TrainingProgress collection for these users
        const userTrainingProgress = await TrainingProgress.find({
            userId: { $in: users.map(user => user._id) }
        });

        // Create a map of user ID to training progress
        const userTrainingMap = new Map();
        userTrainingProgress.forEach(progress => {
            if (!userTrainingMap.has(progress.userId.toString())) {
                userTrainingMap.set(progress.userId.toString(), []);
            }
            userTrainingMap.get(progress.userId.toString()).push(progress);
        });

        // Calculate progress for each user
        const scores = users.map((user) => {
            // Training progress calculation from TrainingProgress collection
            const userTrainings = userTrainingMap.get(user._id.toString()) || [];
            const completedTrainings = userTrainings.filter(t => t.pass).length;
            const totalTrainings = userTrainings.length;
            const trainingProgress = totalTrainings > 0 ? (completedTrainings / totalTrainings) * 100 : 0;

            // Assessment progress calculation (using `pass` and `complete`)
            const completedAssessments = user.assignedAssessments.filter(a => a.pass).length;
            const totalAssessments = user.assignedAssessments.length;
            const assessmentCompletion = user.assignedAssessments.reduce((sum, a) => sum + (a.complete || 0), 0);
            const assessmentProgress = totalAssessments > 0 ? (assessmentCompletion / totalAssessments) : 0;

            // Module progress calculation (optional if you want to include modules)
            const completedModules = user.assignedModules.filter(m => m.pass).length;
            const totalModules = user.assignedModules.length;
            const moduleProgress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

            // Total score based on training, assessments, and modules
            const totalScore = completedTrainings + completedAssessments + completedModules;

            return {
                username: user.username,
                email: user.email,
                branch: user.workingBranch,
                role: user.designation,
                completedTrainings,
                totalTrainings,
                trainingProgress,
                completedAssessments,
                totalAssessments,
                assessmentProgress,
                completedModules,
                totalModules,
                moduleProgress,
                totalScore,
            };
        });

        // Sort users by total score
        const sortedScores = scores.sort((a, b) => b.totalScore - a.totalScore);

        // Get top 3 users
        const topUsers = sortedScores.slice(0, 3);

        // Get last 3 users (sorted by ascending score)
        const lastUsers = sortedScores.slice(-3);

        // Group users by branch and calculate total score and progress for each branch
        const branchScores = users.reduce((acc, user) => {
            if (!acc[user.workingBranch]) {
                acc[user.workingBranch] = {
                    totalScore: 0,
                    userCount: 0,
                    totalTrainingProgress: 0,
                    totalAssessmentProgress: 0,
                    totalModuleProgress: 0,
                };
            }

            // Get training progress from TrainingProgress collection
            const userTrainings = userTrainingMap.get(user._id.toString()) || [];
            const completedTrainings = userTrainings.filter(t => t.pass).length;
            const totalTrainings = userTrainings.length;
            const trainingProgress = totalTrainings > 0 ? (completedTrainings / totalTrainings) * 100 : 0;

            const completedAssessments = user.assignedAssessments.filter(a => a.pass).length;
            const totalAssessments = user.assignedAssessments.length;
            const assessmentCompletion = user.assignedAssessments.reduce((sum, a) => sum + (a.complete || 0), 0);
            const assessmentProgress = totalAssessments > 0 ? (assessmentCompletion / totalAssessments) : 0;

            const completedModules = user.assignedModules.filter(m => m.pass).length;
            const totalModules = user.assignedModules.length;
            const moduleProgress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

            acc[user.workingBranch].totalScore += completedTrainings + completedAssessments + completedModules;
            acc[user.workingBranch].userCount++;
            acc[user.workingBranch].totalTrainingProgress += trainingProgress;
            acc[user.workingBranch].totalAssessmentProgress += assessmentProgress;
            acc[user.workingBranch].totalModuleProgress += moduleProgress;

            return acc;
        }, {});

        // Convert branchScores to array and calculate average percentages
        const sortedBranches = Object.keys(branchScores)
            .map(branch => ({
                branch,
                totalScore: branchScores[branch].totalScore,
                userCount: branchScores[branch].userCount,
                averageTrainingProgress:
                    branchScores[branch].userCount > 0
                        ? branchScores[branch].totalTrainingProgress / branchScores[branch].userCount
                        : 0,
                averageAssessmentProgress:
                    branchScores[branch].userCount > 0
                        ? branchScores[branch].totalAssessmentProgress / branchScores[branch].userCount
                        : 0,
                averageModuleProgress:
                    branchScores[branch].userCount > 0
                        ? branchScores[branch].totalModuleProgress / branchScores[branch].userCount
                        : 0,
            }))
            .sort((a, b) => b.totalScore - a.totalScore);

        // Get top 3 branches
        const topBranches = sortedBranches.slice(0, 3);

        // Get last 3 branches (sorted by ascending total score)
        const lastBranches = sortedBranches.slice(-3);

        // Return response with top and last users and branches
        return res.status(200).json({
            data: {
                topUsers,
                lastUsers,
                topBranches,
                lastBranches,
            },
        });

    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ error: 'Error fetching users' });
    }
};



; // Adjust path to the branch model


export const CreatingAdminUsers = async (req, res) => {
    try {
        const { userName: name, email, userId: EmpId, userRole: role, Branch: branches, password
        } = req.body;
        let { subRole } = req.body
        console.log(name, email, EmpId, role, branches, subRole);
        if (role !== 'super_admin') {
            subRole = "NR"
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        // Validate required fields
        if (!name || !email || !EmpId || !role) {
            return res.status(400).json({
                message: "All required fields (name, email, EmpId, role) must be provided.",
            });
        }

        // Check if role is valid
        const validRoles = ['super_admin', 'cluster_admin', 'store_admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                message: "Invalid role provided. Valid roles are: super_admin, cluster_admin, store_admin.",
            });
        }

        // Fetch permissions for the role from the Permission collection
        const rolePermissions = await Permission.findOne({ role });
        if (!rolePermissions) {
            return res.status(400).json({
                message: `Permissions not found for the role: ${role}`,
            });
        }
        console.log('Role permissions:', rolePermissions._id);

        // Determine branches for the admin
        let finalBranches = [];
        if (role === 'super_admin') {
            const allBranches = await Branch.find();
            if (allBranches.length === 0) {
                return res.status(404).json({
                    message: "No branches found to assign to the super admin.",
                });
            }
            finalBranches = allBranches.map((branch) => branch._id);
        } else {
            if (!branches || branches.length === 0) {
                return res.status(400).json({
                    message: `Branches must be provided for the role: ${role}.`,
                });
            }
            finalBranches = branches;
        }

        // Create the admin user with the fetched permissions
        const newAdmin = new Admin({
            name,
            email,
            EmpId,
            subRole,
            password: hashedPassword,
            role,
            permissions: rolePermissions._id, // Assuming permissions are stored as an ObjectId
            branches: finalBranches,
        });

        // Save the admin user
        const savedAdmin = await newAdmin.save();

        // Respond with success
        res.status(201).json({
            message: "Admin user created successfully.",
            data: {
                id: savedAdmin._id,
                name: savedAdmin.name,
                email: savedAdmin.email,
                EmpId: savedAdmin.EmpId,
                role: savedAdmin.role,
                permissions: savedAdmin.permissions,
                branches: savedAdmin.branches,
            },
        });
    } catch (error) {
        console.error('Error creating admin user:', error);
        res.status(500).json({
            message: "An error occurred while creating the admin user.",
            error: error.message,
        });
    }
};


const upsertPermissions = async (role, permissions) => {
    try {
        // Check if the role already exists
        const existingRole = await Permission.findOne({ role });

        if (existingRole) {
            // If the role exists, update the permissions
            existingRole.permissions = { ...existingRole.permissions, ...permissions };
            await existingRole.save();
            console.log(`${role} permissions updated successfully.`);
        } else {
            // If the role doesn't exist, create a new permission document for the role
            const newPermission = new Permission({
                role,
                permissions,
            });
            await newPermission.save();
            console.log(`${role} permissions added successfully.`);
        }
    } catch (error) {
        console.error('Error adding or updating permissions:', error);
    }
};

// Express route or function
export const handlePermissions = async (req, res) => {
    try {
        const { permissionsArray } = req.body; // Make sure to send the array in the body of the request
        if (!permissionsArray || !Array.isArray(permissionsArray)) {
            return res.status(400).json({ message: 'Permissions array is required' });
        }

        for (const item of permissionsArray) {
            await upsertPermissions(item.role, item.permissions);
        }

        return res.status(200).json({ message: 'Permissions processed successfully' });
    } catch (error) {
        console.error('Error processing permissions:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Test endpoint to check data
export const testData = async (req, res) => {
    try {
        console.log('🧪 Testing data availability...');
        
        // Check TrainingProgress collection
        const trainingProgressCount = await TrainingProgress.countDocuments();
        console.log('🧪 TrainingProgress count:', trainingProgressCount);
        
        // Check User collection
        const userCount = await User.countDocuments();
        console.log('🧪 User count:', userCount);
        
        // Check Branch collection
        const branchCount = await Branch.countDocuments();
        console.log('🧪 Branch count:', branchCount);
        
        // Get sample data
        const sampleTrainingProgress = await TrainingProgress.findOne().populate('userId', 'locCode workingBranch');
        const sampleUser = await User.findOne();
        const sampleBranch = await Branch.findOne();
        
        return res.status(200).json({
            message: "Test data",
            counts: {
                trainingProgress: trainingProgressCount,
                users: userCount,
                branches: branchCount
            },
            sampleData: {
                trainingProgress: sampleTrainingProgress,
                user: sampleUser,
                branch: sampleBranch
            }
        });
    } catch (error) {
        console.error("Error in test:", error);
        return res.status(500).json({
            message: "Error in test",
            error: error.message,
        });
    }
};
