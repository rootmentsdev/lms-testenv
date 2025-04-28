import Admin from '../model/Admin.js';
import AssessmentProcess from '../model/Assessmentprocessschema.js';
import Module from '../model/Module.js'
import Notification from '../model/Notification.js';
import TrainingProgress from '../model/Trainingprocessschema.js';
import User from '../model/User.js';
import Visibility from '../model/Visibility.js';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import Subrole from '../model/Subrole.js';
import EscalationLevel from '../model/EscalationLevel.js';

export const createModule = async (req, res) => {
    try {
        const moduleData = req.body;

        // Validation for the required fields in videos
        if (!moduleData.moduleName || !moduleData.videos || !Array.isArray(moduleData.videos)) {
            return res.status(400).json({ message: "Invalid module data. Ensure all required fields are present." });
        }

        // Validate each video and handle questions
        for (let videoIndex = 0; videoIndex < moduleData.videos.length; videoIndex++) {
            const video = moduleData.videos[videoIndex];

            // Check for required fields in video
            if (!video.title || !video.videoUri) {
                return res.status(400).json({
                    message: `Missing required fields in video ${videoIndex + 1}: title or videoUri is missing.`
                });
            }

            // If no questions array, set it to an empty array
            if (!video.questions || !Array.isArray(video.questions)) {
                video.questions = [];
            }

            // Check if the questions array contains incomplete questions
            let hasIncompleteQuestion = false;
            for (let questionIndex = 0; questionIndex < video.questions.length; questionIndex++) {
                const question = video.questions[questionIndex];

                if (
                    !question.questionText ||
                    !question.correctAnswer ||
                    !question.options ||
                    question.options.length < 4
                ) {
                    hasIncompleteQuestion = true;
                    break; // Exit the loop if any question is incomplete
                }
            }

            // If incomplete question exists, set questions array to null
            if (hasIncompleteQuestion) {
                video.questions = null;
            }
        }

        // Save the module
        const newModule = new Module(moduleData);
        await newModule.save();

        res.status(201).json({ message: "Module created successfully!", module: newModule });
    } catch (error) {
        console.error("Error creating module:", error);
        if (!res.headersSent) {
            res.status(500).json({ message: "An error occurred while creating the module.", error: error.message });
        }
    }
};
export const getModules = async (req, res) => {
    try {
        const { id } = req.params; // Extract module ID if provided

        if (id) {
            // Fetch a specific module by ID
            const module = await Module.findById(id).populate('videos.questions');
            if (!module) {
                return res.status(404).json({ message: 'Module not found' });
            }
            return res.status(200).json(module);
        }

        // Fetch all modules
        const modules = await Module.find().populate('videos.questions');

        // Fetch training progress
        const trainingProgress = await TrainingProgress.find();

        // Calculate completion percentage for each module
        const moduleProgress = modules.map((module) => {
            const usersProgress = trainingProgress.map((progress) => {
                const moduleProgress = progress.modules.find((m) => m.moduleId.toString() === module._id.toString());
                if (!moduleProgress) return 0; // If module not found, 0% progress

                const completedVideos = moduleProgress.videos.filter((v) => v.pass).length;
                const totalVideos = moduleProgress.videos.length;
                const percentage = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;
                return percentage;
            });

            const overallPercentage =
                usersProgress.reduce((acc, curr) => acc + curr, 0) / usersProgress.length || 0;

            // Include videos array
            return {
                moduleId: module._id,
                moduleName: module.moduleName,
                videos: module.videos, // Add videos here
                overallCompletionPercentage: overallPercentage.toFixed(2),
            };
        });

        return res.status(200).json(moduleProgress);
    } catch (error) {
        console.error('Error fetching modules:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const GetAssessmentDetails = async (req, res) => {
    try {
        const { id } = req.params; // Extract assessment ID
        console.log(`Assessment ID: ${id}`);

        // Find all users assigned to the specified assessment
        const userdata = await User.find({ 'assignedAssessments.assessmentId': id })
            .select({
                _id: 1,
                username: 1,
                email: 1,
                empID: 1,
                workingBranch: 1, designation: 1,
                'assignedAssessments': { $elemMatch: { assessmentId: id } }, // Select only the matching assessment
            });


        // Extract user IDs from the userdata array
        const userIds = userdata.map(user => user._id);

        // Find assessment progress for the specified assessment and user IDs
        // Populate user details for better response

        console.log('User Data:', userdata);


        res.status(200).json({
            message: 'Assessment details fetched successfully',
            data: {
                users: userdata,

            },
        });
    } catch (error) {
        console.error('Error fetching assessment details:', error);
        res.status(500).json({
            message: 'Internal server error',
        });
    }
};
export const ChangeVisibility = async (req, res) => {
    try {
        const trainingData = req.body;
        console.log(trainingData);


        if (!Array.isArray(trainingData)) {
            return res.status(400).json({ message: "Invalid data format" });
        }

        console.log("Received Data:", trainingData); // Debugging log

        for (const section of trainingData) {
            const { section: sectionName, role } = section;

            for (const rol of role) {
                // Use upsert to update if the role exists or insert if it doesn't
                const updateQuery = {
                    [`${sectionName}.role`]: rol.role,
                };

                const updateData = {
                    $set: {
                        [`${sectionName}.$.visibility`]: rol.visibility,
                    },
                };

                // Push a new role if it doesn't exist
                const pushData = {
                    $push: {
                        [sectionName]: {
                            role: rol.role,
                            visibility: rol.visibility,
                        },
                    },
                };

                const result = await Visibility.findOneAndUpdate(
                    updateQuery,
                    updateData,
                    { new: true }
                );

                if (!result) {
                    // If no match is found, insert a new role
                    await Visibility.updateOne({}, pushData, { upsert: true });
                }
            }
        }

        res.status(200).json({ message: "Visibility settings updated successfully" });
    } catch (error) {
        console.error("Error updating visibility:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const getVisibility = async (req, res) => {
    try {

        const data = await Visibility.find()
        res.status(200).json({ message: "Visibility settings updated successfully", Data: data });
    } catch (error) {
        console.error("Error updating visibility:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const AdminLogin = async (req, res) => {
    const { EmpId, email } = req.body;
    console.log('Login Attempt:', { EmpId, email });

    try {
        // Find user by email
        const user = await Admin.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        console.log('User Found:', user);

        // Compare entered EmpId (as password) with the stored hashed password
        if (!user.password) {
            return res.status(500).json({ message: 'User password is not set in the database.' });
        }

        const isPasswordValid = await bcrypt.compare(EmpId, user.password);
        console.log('Password Validation:', isPasswordValid);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create payload for the JWT
        const payload = {
            userId: user._id,
            username: user.name,
            role: user.role,
        };

        // Sign the JWT token with secret key
        const token = jwt.sign(payload, process.env.JWT_SECRET);

        // Send the token in the response
        res.json({ token, user: payload });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


// Adjust the path according to your project structure

// Fetch first three notifications
export const getNotifications = async (req, res) => {
    try {
        // Fetch the first three notifications, sorted by createdAt in descending order (latest first)
        const notifications = await Notification.find()
            .sort({ createdAt: -1 })  // Sort by 'createdAt' field in descending order
            .limit(3);  // Limit the result to 3 notifications

        if (!notifications || notifications.length === 0) {
            return res.status(404).json({ message: 'No notifications found' });
        }

        // Send the notifications as a response
        res.status(200).json({ notifications });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
export const getAllNotifications = async (req, res) => {
    try {
        // Fetch the first three notifications, sorted by createdAt in descending order (latest first)
        const notifications = await Notification.find()
            .sort({ createdAt: -1 })  // Sort by 'createdAt' field in descending order
        // Limit the result to 3 notifications

        if (!notifications || notifications.length === 0) {
            return res.status(404).json({ message: 'No notifications found' });
        }

        // Send the notifications as a response
        res.status(200).json({ notifications });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};





export const Subroles = async (req, res) => {
    try {
        const { subrole, roleCode, level } = req.body;

        // Validation (Optional)
        if (!subrole || !roleCode || !level) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const newSubrole = new Subrole({ subrole, roleCode, level });
        await newSubrole.save();

        res.status(201).json({ message: 'Subrole added successfully.', subrole: newSubrole });
    } catch (error) {
        console.error('Error creating subrole:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

export const GetSubroles = async (req, res) => {
    try {


        const newSubrole = await Subrole.find()
        if (!newSubrole) {
            return res.status(404).json({
                message: "Subrole not found"
            })
        }


        res.status(201).json({ message: 'Subrole added successfully.', subrole: newSubrole });
    } catch (error) {
        console.error('Error creating subrole:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};


export const upsertEscalationLevel = async (req, res) => {
    const { tableData } = req.body; // Extract tableData from the request body

    if (!Array.isArray(tableData)) {
        return res.status(400).json({ message: "Invalid input: tableData must be an array" });
    }

    try {
        const results = await Promise.all(
            tableData.map(async (item) => {
                const { id, level, context, numberOfDays } = item;

                // Find and update or create if not found
                let escalationLevel = await EscalationLevel.findOneAndUpdate(
                    { id }, // Query by ID
                    { level, context, numberOfDays }, // Fields to update
                    { new: true, upsert: true, runValidators: true } // Create if not exists, return updated document
                );

                return escalationLevel;
            })
        );

        // Respond with all updated or created documents
        res.status(200).json({ message: "Successfully processed escalation levels", results });
    } catch (error) {
        // Handle errors
        res.status(500).json({ message: "Failed to process escalation levels", error: error.message });
    }
};

export const getEscalationLevel = async (req, res) => {


    try {
        const results = await EscalationLevel.find()
        if (!results) {
            res.status(404).json({ message: "no data processed escalation levels" });

        }

        // Respond with all updated or created documents
        res.status(200).json({ message: "Successfully processed escalation levels", data: results });
    } catch (error) {
        // Handle errors
        res.status(500).json({ message: "Failed to process escalation levels", error: error.message });
    }
};