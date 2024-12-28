import User from '../model/User.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import Branch from '../model/Branch.js';
import TrainingProgress from '../model/Trainingprocessschema.js';
dotenv.config()
// Function to create a new user
export const createUser = async (req, res) => {
  try {
    const {
      username,
      email,
      empID,
      locCode,
      designation,
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
      designation,
      workingBranch,
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully.', user: newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'An error occurred while creating the user.', error: error.message });
  }
};




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
        message: "user founds",
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


export const GetuserTraining = async (req, res) => {
  const { email } = req.body; // Extract request body

  try {
    // Find user based on email and populate training and modules separately
    const user = await User.findOne({ email })
      .populate({
        path: 'training.trainingId', // Populate the training details
        populate: {
          path: 'modules', // Populate the modules array inside each training
          model: 'Module' // Specify the 'Module' model for the population
        }
      });

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return user data with populated training and modules
    res.status(200).json({
      message: "Data found",
      data: user
    });

  } catch (error) {
    console.error('Error finding user:', error.message);
    res.status(500).json({ message: "Server error while finding user" });
  }
};


export const GetuserTrainingprocess = async (req, res) => {
  const { userId, trainingId } = req.body; // Extract request body

  try {
    const traingproess = await TrainingProgress.find({
      userId,
      trainingId
    });

    if (!traingproess || traingproess.length === 0) {
      return res.status(404).json({ message: "No data" });
    }

    // Calculate the percentage of completion
    const trainingData = traingproess[0];
    let totalModules = 0;
    let completedModules = 0;
    let totalVideos = 0;
    let completedVideos = 0;

    // Iterate through the modules and videos to calculate the percentage
    trainingData.modules.forEach(module => {
      totalModules++;
      if (module.pass) {
        completedModules++;
      }

      module.videos.forEach(video => {
        totalVideos++;
        if (video.pass) {
          completedVideos++;
        }
      });
    });

    // Calculate the completion percentages
    const moduleCompletionPercentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
    const videoCompletionPercentage = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;

    // Calculate overall percentage (average of module and video completion)
    const overallCompletionPercentage = (moduleCompletionPercentage + videoCompletionPercentage) / 2;

    // Return user data with populated training, modules, and percentage of completion
    res.status(200).json({
      message: "Data found",
      data: trainingData,
      completionPercentage: overallCompletionPercentage.toFixed(2) // Rounded to 2 decimal places
    });

  } catch (error) {
    console.error('Error finding user:', error.message);
    res.status(500).json({ message: "Server error while finding user" });
  }
};


export const UpdateuserTrainingprocess = async (req, res) => {
  const { userId, trainingId, moduleId, videoId } = req.body; // Extract request body

  try {
    // Find the training progress by userId and trainingId
    const trainingProgress = await TrainingProgress.findOne({ userId, trainingId });

    if (!trainingProgress) {
      return res.status(404).json({ message: "Training progress not found" });
    }

    // Find the module by moduleId in the training progress
    const module = trainingProgress.modules.find(mod => mod.moduleId.toString() === moduleId);

    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    // Find the video by videoId inside the module's videos
    const video = module.videos.find(v => v.videoId.toString() === videoId);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Update the pass field of the video to true
    video.pass = true;

    // Check if all videos in the module are passed
    const allVideosPassed = module.videos.every(v => v.pass === true);

    // If all videos are passed, update the module's pass field to true
    if (allVideosPassed) {
      module.pass = true;
    }

    // Check if all modules in the training are passed
    const allModulesPassed = trainingProgress.modules.every(mod => mod.pass === true);

    // If all modules are passed, update the training's pass field to true
    if (allModulesPassed) {
      trainingProgress.pass = true;
    }

    // Save the updated training progress
    await trainingProgress.save();

    // Return the updated training progress
    res.status(200).json({
      message: "Training progress updated successfully",
      data: trainingProgress
    });

  } catch (error) {
    console.error('Error updating training progress:', error.message);
    res.status(500).json({ message: "Server error while updating training progress" });
  }
};
