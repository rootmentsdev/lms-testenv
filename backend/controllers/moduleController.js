import Admin from '../model/Admin.js';
import AssessmentProcess from '../model/Assessmentprocessschema.js';
import Module from '../model/Module.js'
import TrainingProgress from '../model/Trainingprocessschema.js';
import User from '../model/User.js';
import Visibility from '../model/Visibility.js';
import jwt from 'jsonwebtoken'

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
    console.log(EmpId, email);

    try {
        // Find user by username
        const user = await Admin.findOne({
            EmpId: EmpId,  // assuming `EmpId` is a unique field
            email: email   // assuming `email` is unique as well
        });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Compare entered password with the stored hashed password


        // Create payload for the JWT
        const payload = {
            userId: user._id,
            username: user.userName,
        };

        // Sign the JWT token with secret key
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send the token in the response
        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}