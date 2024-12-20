import User from '../model/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
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



// Login User
export const loginUser = async (req, res) => {
  const { email, password } = req.body; // Destructure email and password from the request body

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create a JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET, // Secret key for signing JWT (should be in your .env file)
      { expiresIn: '30d' } // Token expiration time (30 days)
    );

    // Send response with the token and user data
    res.status(200).json({
      message: 'Login successful',
      token, // Send the JWT token in the response
      user: {
        username: user.username,
        email: user.email,
        empID: user.empID,
        location: user.location,
        workingBranch: user.workingBranch,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
