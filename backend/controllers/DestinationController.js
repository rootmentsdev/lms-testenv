import Branch from "../model/Branch.js";
import Designation from "../model/designation.js"; // Import the destination model
import User from "../model/User.js";

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
        // Fetch all branches and users
        const branches = await Branch.find();
        const users = await User.find();

        // Create a map of locCode to users for quick lookup
        const userMap = new Map();
        for (const user of users) {
            if (!userMap.has(user.locCode)) {
                userMap.set(user.locCode, []);
            }
            userMap.get(user.locCode).push(user);
        }

        const allData = branches.map((branch) => {
            const branchUsers = userMap.get(branch.locCode) || [];
            let trainingCount = 0;
            let trainingCountPending = 0;
            let assessmentCount = 0;
            let assessmentCountPending = 0;

            // Calculate counts for the branch
            branchUsers.forEach((user) => {
                trainingCount += user.training.length;
                assessmentCount += user.assignedAssessments.length;
                trainingCountPending += user.training.filter((item) => item.pass === false).length;
                assessmentCountPending += user.assignedAssessments.filter((item) => item.pass === false).length;
            });

            return {
                totalTraining: trainingCount,
                totalAssessment: assessmentCount,
                pendingTraining: (trainingCountPending / trainingCount) * 100 || 0,
                completeTraining: ((trainingCount - trainingCountPending) / trainingCount) * 100 || 0,
                pendingAssessment: (assessmentCountPending / assessmentCount) * 100 || 0,
                completeAssessment: ((assessmentCount - assessmentCountPending) / assessmentCount) * 100 || 0,
                locCode: branch.locCode,
                branchName: branch.workingBranch,
            };
        });

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
        // Fetch users with populated training and assigned assessments
        const users = await User.find().populate({
            path: 'training.trainingId',
        }).populate({
            path: 'assignedAssessments.assessmentId',
        });

        // Calculate progress for each user
        const scores = users.map((user) => {
            // Calculate training progress percentage
            const completedTrainings = user.training.filter(t => t.pass).length;
            const totalTrainings = user.training.length;
            const trainingProgress = totalTrainings > 0 ? (completedTrainings / totalTrainings) * 100 : 0;

            // Calculate assessment progress percentage
            const completedAssessments = user.assignedAssessments.filter(a => a.pass).length;
            const totalAssessments = user.assignedAssessments.length;
            const assessmentProgress = totalAssessments > 0 ? (completedAssessments / totalAssessments) * 100 : 0;

            // Total score (just summing up completed training and assessments for ranking)
            const totalScore = completedTrainings + completedAssessments;

            return {
                username: user.username,
                email: user.email,
                branch: user.workingBranch,
                role: user.designation,
                completedTrainings,
                totalTrainings,
                trainingProgress, // Percentage progress for training
                completedAssessments,
                totalAssessments,
                assessmentProgress, // Percentage progress for assessments
                totalScore,
            };
        });

        // Sort users by total score and get the top 3
        const topUsers = scores.sort((a, b) => b.totalScore - a.totalScore).slice(0, 3);

        // Send the top 3 users with progress percentages in the response
        return res.status(200).json({ data: topUsers });

    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ error: 'Error fetching users' });
    }
};



