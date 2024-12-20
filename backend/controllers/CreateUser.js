import User from '../model/User.js';
import bcrypt from 'bcrypt';

// Function to create a new user
export const createUser = async (req, res) => {
    try {
        const {
            username,
            password,
            email,
            empID,
            location,
            workingBranch,
        } = req.body;

        // Check if the username or email already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already exists.' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            username,
            password: hashedPassword,
            email,
            empID,
            location,
            workingBranch,
        });

        await newUser.save();
        res.status(201).json({ message: 'User created successfully.', user: newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'An error occurred while creating the user.', error: error.message });
    }
};
