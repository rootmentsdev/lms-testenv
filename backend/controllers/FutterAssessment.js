import AssessmentProcess from "../model/Assessmentprocessschema.js";
import User from "../model/User.js";

export const UserAssessmentGet = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const userAssessment = await User.findOne({ email }).populate({
            path: 'assignedAssessments.assessmentId',
            select: '-questions', // Excludes the 'questions' field
        }).select('-training');

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

export const Usergetquestions = async (req, res) => {
    try {
        const { userId, assessmentId } = req.query;
        console.log(userId, assessmentId);

        const userAssessment = await User.findOne(
            {
                _id: userId,
                "assignedAssessments.assessmentId": assessmentId
            },
            {
                _id: 1,
                username: 1,
                email: 1,
                locCode: 1,
                empID: 1,
                designation: 1,
                workingBranch: 1,
                "assignedAssessments.$": 1,
                // Select only the specific matching assignedAssessment
            }
        ).populate({
            path: 'assignedAssessments.assessmentId',
        });
        if (!userAssessment) {
            return res.status(404).json({
                message: "NO Question found"
            })

        }
        res.status(200).json({
            message: "Data fetch successfull ",
            data: userAssessment
        })
    } catch (error) {
        console.error(error);  // Log the error for debugging purposes
        res.status(500).json({
            message: "Internal server error",
            error: error.message  // Optionally include the error message
        });

    }
}

export const userAssessmentUpdate = async (req, res) => {
    try {
        const { userId, assessmentId, questions } = req.body;

        console.log("User ID:", userId);
        console.log("Assessment ID:", assessmentId);

        // Find the assessment process for the user and specific assessment
        const assessmentProcess = await AssessmentProcess.findOne({
            userId,
            assessmentId,
        });

        if (!assessmentProcess) {
            return res.status(404).json({ message: "Assessment not found" });
        }

        // Iterate over the user's submitted answers and validate them
        for (const userQuestion of questions) {
            const assessmentQuestion = assessmentProcess.answers.find(
                (a) => a.questionId.toString() === userQuestion.questionId
            );

            if (assessmentQuestion) {
                // Update the answer details
                assessmentQuestion.selectedAnswer = userQuestion.selectedAnswer || "";
                assessmentQuestion.isCorrect =
                    assessmentQuestion.correctAnswer === assessmentQuestion.selectedAnswer;
            }
        }

        // Calculate total marks (count of correct answers)
        const totalCorrect = assessmentProcess.answers.filter((a) => a.isCorrect).length;

        // Calculate the total marks out of 100
        const totalMarks = (totalCorrect / assessmentProcess.answers.length) * 100;

        // Set the 'passed' field as a boolean based on the number of correct answers
        const passingThreshold = 50; // Passing threshold is 50%
        assessmentProcess.passed = totalMarks >= passingThreshold;

        // Update the 'totalMarks' field (if exists in the schema)
        assessmentProcess.totalMarks = totalMarks; // Update the totalMarks field directly

        // Save the updated assessment process
        await assessmentProcess.save();

        // Update the user's assigned assessment
        const user = await User.findOne({ _id: userId, "assignedAssessments.assessmentId": assessmentId });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find the specific assignedAssessment to update
        const assignedAssessment = user.assignedAssessments.find(
            (assessment) => assessment.assessmentId.toString() === assessmentId
        );

        if (assignedAssessment) {
            // Update the assigned assessment details
            assignedAssessment.status = 'Completed';
            assignedAssessment.complete = totalMarks;
            assignedAssessment.pass = totalMarks >= passingThreshold;
        }

        // Save the updated user
        await user.save();

        res.status(200).json({
            message: "Assessment updated successfully",
            data: assessmentProcess,
        });
    } catch (error) {
        console.error("Error updating assessment:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};
