import User from '../model/User.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import Branch from '../model/Branch.js';
dotenv.config()
// Function to create a new user
export const createUser = async (req, res) => {
  try {
    const {
      username,
      email,
      empID,
      locCode,
      location,
      workingBranch,
    } = req.body;

    // Check if the username or email already exists
    const existingUser = await User.findOne({ $or: [{ email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists.' });
    }

    // Hash the password before saving

    // Create a new user
    const newUser = new User({
      username,
      email,
      empID,
      location,
      locCode,
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
  const { email, empID } = req.body;

  try {
    // Input validation
    if (!email || !empID) {
      return res.status(400).json({ message: 'Email and Employee ID are required' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare empID (Consider hashing for better security)
    const isMatch = empID === user.empID;
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Ensure JWT secret is available
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT secret is not defined in environment variables');
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role }, // Add claims if required
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Send response
    res.status(200).json({
      message: 'Login successful',
      token,
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




export const GetAllUser = async (req, res) => {
  try {

    const response = await User.find()

    if (response) {
      res.status(200).json({
        message: "user found",
        data: response
      })
    } else {
      res.status(404).json({
        message: "no user"
      })
    }

  } catch (error) {
    res.status(500).json({
      message: 'internal server error'
    })
  }
}

// Adjust the path as needed

export const createBranch = async (req, res) => {
  const { locCode, workingBranch } = req.body;

  const exit = await Branch.findOne({ locCode })
  if (exit) {
    return res.status(400).json({ message: "branch exit" })

  }
  const newBranch = new Branch({
    locCode: locCode,
    workingBranch: workingBranch,
  });

  try {
    const savedBranch = await newBranch.save();
    console.log('New branch created:', savedBranch);

    if (savedBranch) {
      return res.status(201).json({ message: "branch create", data: savedBranch })
    }
  } catch (error) {
    console.error('Error creating branch:', error.message);
    res.status(500).json({ message: "branch create error" })
  }
};

export const GetBranch = async (req, res) => {


  try {
    const response = await Branch.find()

    if (response) {
      res.status(200).json({
        message: "data find", data: response
      })
    }


  } catch (error) {
    console.error('Error find branch:', error.message);
    res.status(500).json({ message: "branch finding error" })
  }
};

