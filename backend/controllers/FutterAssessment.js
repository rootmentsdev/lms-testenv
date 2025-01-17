import User from "../model/User.js";

export const UserAssessmentGet = async (req, res) => {
    try {
        const { email } = req.query;
        
        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const userAssessment = await User.findOne({ email }).populate('assignedAssessments.assessmentId').select('-training');
        
        if (!userAssessment) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        
        res.status(200).json({
            message: "OK",
            data: userAssessment
        });
    } catch (error) {
        console.error(error);  // Log the error for debugging purposes
        res.status(500).json({
            message: "Internal server error",
            error: error.message  // Optionally include the error message
        });
    }
};
