export const GetAssessmentdetailes = async (req, res) => {
    try {
        const { id } = req.params;

    } catch (error) {
        res.status(500).json({
            message: "internal sever error"
        })
    }
}


export const AssignToUserAssessment = async (req, res) => {
    try {
        const { id } = req.params;

    } catch (error) {
        res.status(500).json({
            message: "internal sever error"
        })
    }
}
