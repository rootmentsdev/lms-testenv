import Assessment from "../model/Assessment.js";



// Controller function to create an assessment
export const createAssessment = async (req, res) => {
    try {
        const assessmentData = req.body;

        // Validate input
        if (!assessmentData.title || !assessmentData.description || !Array.isArray(assessmentData.questions)) {
            return res.status(400).json({ message: "Invalid assessment data. Ensure all required fields are present." });
        }

        // Create and save the assessment
        const newAssessment = new Assessment(assessmentData);
        await newAssessment.save();

        res.status(201).json({ message: "Assessment created successfully!", assessment: newAssessment });
    } catch (error) {
        console.error("Error creating assessment:", error);
        res.status(500).json({ message: "An error occurred while creating the assessment.", error: error.message });
    }
};
