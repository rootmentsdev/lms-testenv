import User from '../model/User.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import Branch from '../model/Branch.js';
import TrainingProgress from '../model/Trainingprocessschema.js';
import Module from '../model/Module.js';
dotenv.config()

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
    // Fetch all branches
    const branches = await Branch.find();

    // If branches are found, fetch the user count and training count based on locCode for each branch
    if (branches.length > 0) {
      const branchesWithUserAndTrainingCount = await Promise.all(branches.map(async (branch) => {
        // Count users based on locCode for each branch
        const userCount = await User.countDocuments({ locCode: branch.locCode });

        // Fetch all users for the current branch to count their training modules
        const usersInBranch = await User.find({ locCode: branch.locCode });

        // Count total training modules for each user
        let totalTrainingCount = 0;
        for (let user of usersInBranch) {
          // Assuming 'trainingModules' is an array or reference to modules in the user schema
          totalTrainingCount += user.training.length;
        }
        let totalAssessmentCount = 0;
        for (let user of usersInBranch) {
          totalAssessmentCount += user.assignedAssessments.length;
        }

        return {
          ...branch.toObject(), // Include all branch data
          userCount, // Add the user count based on locCode
          totalTrainingCount, // Add the total training count for users in this branch
          totalAssessmentCount
        };
      }));

      res.status(200).json({
        message: "Data found",
        data: branchesWithUserAndTrainingCount
      });
    } else {
      res.status(404).json({ message: "No branches found" });
    }

  } catch (error) {
    console.error('Error finding branch:', error.message);
    res.status(500).json({ message: "Error finding branch" });
  }
};



export const GetuserTraining = async (req, res) => {
  const { email } = req.query; // Extract email from query

  try {
    // Find user based on email and populate training and modules separately
    const user = await User.findOne({ email })
      .populate({
        path: 'training.trainingId', // Populate the training details

      });

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch all training progress using user ID
    const trainingProgress = await TrainingProgress.find({ userId: user._id });

    // Process each training to calculate completion percentages
    const trainingDetails = user.training.map(training => {
      const progress = trainingProgress.find(p => p.trainingId.toString() === training.trainingId._id.toString());

      if (!progress) {
        return {
          trainingId: training.trainingId._id,
          name: training.trainingId.name,
          completionPercentage: 0
        };
      }

      let totalModules = 0;
      let completedModules = 0;
      let totalVideos = 0;
      let completedVideos = 0;

      // Iterate through modules and calculate completion
      progress.modules.forEach(module => {
        totalModules++;
        if (module.pass) completedModules++;

        module.videos.forEach(video => {
          totalVideos++;
          if (video.pass) completedVideos++;
        });
      });

      const moduleCompletionPercentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
      const videoCompletionPercentage = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;
      const overallCompletionPercentage = (moduleCompletionPercentage + videoCompletionPercentage) / 2;

      return {
        trainingId: training.trainingId._id,
        name: training.trainingId.name,
        completionPercentage: overallCompletionPercentage.toFixed(2)
      };
    });

    // Calculate the overall completion percentage for the user (average of all training completions)
    const totalCompletionPercentage = trainingDetails.reduce((sum, training) => sum + parseFloat(training.completionPercentage), 0);
    const userOverallCompletionPercentage = trainingDetails.length > 0 ? (totalCompletionPercentage / trainingDetails.length).toFixed(2) : 0;

    // Return user data with training completion percentages and overall completion percentage
    res.status(200).json({
      message: "Data found",
      data: {
        user,
        trainingProgress: trainingDetails,
        userOverallCompletionPercentage // Include overall user completion percentage
      }
    });

  } catch (error) {
    console.error('Error finding user:', error.message);
    res.status(500).json({ message: "Server error while finding user" });
  }
};


export const GetuserTrainingprocess = async (req, res) => {
  const { userId, trainingId } = req.query; // Extract request body

  try {
    const traingproess = await TrainingProgress.find({
      userId,
      trainingId
    }).populate({
      path: 'trainingId', // Populate trainingId first
      populate: {
        path: 'modules', // Populate modules inside trainingId
        populate: {
          path: 'videos', // Populate videos inside modules
        },
      },
    })
      .exec();

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
  const { userId, trainingId, moduleId, videoId } = req.query;

  // Validate input parameters
  if (!userId || !trainingId || !moduleId || !videoId) {
    return res.status(400).json({ message: "Missing required query parameters" });
  }

  try {
    // Find the training progress
    const trainingProgress = await TrainingProgress.findOne({ userId, trainingId });

    if (!trainingProgress) {
      return res.status(404).json({ message: "Training progress not found" });
    }

    // Find the module in the training progress
    const module = trainingProgress.modules.find(mod => mod.moduleId.toString() === moduleId);

    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    // Find the video in the module
    const video = module.videos.find(v => v.videoId.toString() === videoId);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Update video status
    if (!video.pass) {
      video.pass = true; // Mark video as passed
    }

    // Update module status if all videos are passed
    const allVideosPassed = module.videos.every(v => v.pass === true);
    if (allVideosPassed && !module.pass) {
      module.pass = true;
    }

    // Update training status
    const allModulesPassed = trainingProgress.modules.every(mod => mod.pass === true);

    if (allModulesPassed) {
      trainingProgress.pass = true;
      trainingProgress.status = 'Completed'; // Mark training as completed
    } else {
      trainingProgress.status = 'In Progress'; // Mark training as in progress
    }

    // Save updated training progress
    await trainingProgress.save();

    // ===== Update User Collection =====
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user training status
    const userTraining = user.training.find(train => train.trainingId.toString() === trainingId);
    if (userTraining) {
      userTraining.status = trainingProgress.status; // Sync user status with training status
      userTraining.pass = trainingProgress.pass; // Sync pass status
    }

    // Save updated user status
    await user.save();

    // Send success response
    res.status(200).json({
      message: "Training progress and user status updated successfully",
      data: { trainingProgress, user },
    });

  } catch (error) {
    console.error('Error updating training progress and user status:', error.stack);
    res.status(500).json({ message: "Server error while updating progress and user status" });
  }
};




export const GetuserTrainingprocessmodule = async (req, res) => {
  const { userId, trainingId, moduleId } = req.query; // Extract request query

  try {
    // Find training progress and populate nested fields
    const traingproess = await TrainingProgress.find({
      userId,
      trainingId
    })
      .populate({
        path: 'trainingId', // Populate trainingId first
        populate: {
          path: 'modules', // Populate modules inside trainingId
          populate: {
            path: 'videos', // Populate videos inside modules
          },
        },
      })
      .exec();

    // Check if data exists
    if (!traingproess || traingproess.length === 0) {
      return res.status(404).json({ message: "No data" });
    }

    // Extract the training data
    const trainingData = traingproess[0];

    // Filter the requested module by moduleId
    const selectedModule = trainingData.modules.find(
      (module) => module.moduleId.toString() === moduleId
    );

    // Check if module is found
    if (!selectedModule) {
      return res.status(404).json({ message: "Module not found" });
    }

    // Calculate completion percentages for the specific module
    let totalVideos = selectedModule.videos.length;
    let completedVideos = selectedModule.videos.filter((video) => video.pass).length;

    // Calculate percentage completion
    const videoCompletionPercentage = totalVideos > 0
      ? (completedVideos / totalVideos) * 100
      : 0;
    const moduledata = await Module.findById(selectedModule.moduleId)

    // Return response with module data and percentage completion
    res.status(200).json({
      message: "Module data found",
      data: selectedModule,
      moduledata: moduledata,
      completionPercentage: videoCompletionPercentage.toFixed(2) // Rounded to 2 decimal places
    });

  } catch (error) {
    console.error('Error finding module:', error.message);
    res.status(500).json({ message: "Server error while finding module" });
  }
};
