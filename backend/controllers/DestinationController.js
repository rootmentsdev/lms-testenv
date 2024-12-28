import Designation from "../model/designation.js"; // Import the destination model

// Controller to create a new destination
export const createDesignation = async (req, res) => {
    try {
        // Check if the destination is provided in the request body
        const { designation } = req.body;

        if (!designation) {
            return res.status(400).json({ message: "Destination is required" });
        }

        // Create a new destination document
        const newDestination = new Designation({
            designation
        });

        // Save the new designation to the database
        const saveddesignation = await newDestination.save();

        return res.status(201).json({
            message: "designation created successfully",
            data: saveddesignation,
        });
    } catch (error) {
        console.error("Error creating designation:", error);
        return res.status(500).json({
            message: "Error creating designation",
            error: error.message,
        });
    }
};



// Controller to get all destinations
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
