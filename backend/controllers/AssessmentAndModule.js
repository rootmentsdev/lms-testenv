
import Assessment from '../model/Assessment.js';
import TrainingProgress from '../model/Trainingprocessschema.js';
import { Training } from '../model/Traning.js';
import User from '../model/User.js';

export const assignModuleToUser = async (req, res) => {
  try {
    const { userId, moduleId, deadline } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const defaultDeadline = new Date();
    defaultDeadline.setDate(defaultDeadline.getDate() + 30);

    user.assignedModules.push({
      moduleId,
      deadline: deadline || defaultDeadline
    });

    await user.save();
    res.status(200).json({ message: 'Module assigned successfully.', user });
  } catch (error) {
    console.error('Error assigning module:', error);
    res.status(500).json({ message: 'An error occurred while assigning the module.', error: error.message });
  }
};

export const assignAssessmentToUser = async (req, res) => {
  try {
    const { userId, assessmentId, deadline } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const defaultDeadline = new Date();
    defaultDeadline.setDate(defaultDeadline.getDate() + 30);

    user.assignedAssessments.push({
      assessmentId,
      deadline: deadline || defaultDeadline
    });

    await user.save();
    res.status(200).json({ message: 'Assessment assigned successfully.', user });
  } catch (error) {
    console.error('Error assigning assessment:', error);
    res.status(500).json({ message: 'An error occurred while assigning the assessment.', error: error.message });
  }
};

export const GetAllTrainingWithCompletion = async (req, res) => {
  try {
    // Fetch all trainings
    const trainings = await Training.find({ Trainingtype: 'Assigned' }).populate('modules'); // Populate modules for reference

    if (!trainings || trainings.length === 0) {
      return res.status(404).json({ message: "No training data found" });
    }

    // Process each training to calculate completion percentages
    const trainingData = await Promise.all(
      trainings.map(async (training) => {
        const progressRecords = await TrainingProgress.find({
          trainingId: training._id
        }).populate('userId', 'workingBranch designation username email'); // Populate user data

        let totalUsers = 0;
        let totalPercentage = 0;
        const userProgress = []; // Store user progress for each training
        const uniqueBranches = new Set(); // To store unique branches
        const uniqueDesignations = new Set(); // To store unique designations

        // Calculate completion percentage for each user's progress
        await Promise.all(progressRecords.map(async (record) => {
          totalUsers++;

          let totalModules = 0;
          let completedModules = 0;
          let totalVideos = 0;
          let completedVideos = 0;
          const videoCompletionMap = new Map(); // To track which videos have been completed

          record.modules.forEach((module) => {
            totalModules++;

            // Count completed modules
            if (module.pass) completedModules++;

            module.videos.forEach((video) => {
              totalVideos++;

              // Track the video completion by video ID, ensuring each video is only counted once
              if (video.pass && !videoCompletionMap.has(video._id.toString())) {
                completedVideos++;
                videoCompletionMap.set(video._id.toString(), true);
              }
            });
          });

          // Calculate the completion percentages based on module and video completion
          const moduleCompletion = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
          const videoCompletion = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;

          // The user's overall completion percentage is weighted (40% for modules, 60% for videos)
          const userPercentage = (moduleCompletion * 0.4) + (videoCompletion * 0.6);

          totalPercentage += userPercentage;

          // Add unique workingBranch and designation
          const { workingBranch, designation, username, email } = record.userId || {};
          if (workingBranch) uniqueBranches.add(workingBranch);
          if (designation) uniqueDesignations.add(designation);

          // Store user progress for each user
          userProgress.push({
            userId: record.userId?._id,
            username,
            email,
            workingBranch,
            designation,
            modules: record.modules,
            overallCompletionPercentage: userPercentage.toFixed(2), // User's completion percentage
          });
        }));

        // Calculate average completion percentage for the training based on all users
        const averageCompletionPercentage = totalUsers > 0 ? (totalPercentage / totalUsers).toFixed(2) : 0;

        return {
          trainingId: training._id,
          trainingName: training.trainingName,
          trainingTitle: training.title,
          numberOfModules: training.modules.length,
          totalUsers,
          averageCompletionPercentage, // The average completion percentage for all users
          uniqueBranches: Array.from(uniqueBranches), // Convert Set to Array
          uniqueItems: Array.from(uniqueDesignations), // Convert Set to Array
          userProgress // Return the detailed user progress
        };
      })
    );
    console.log(trainingData);


    // Return training data with percentages and unique values
    res.status(200).json({
      message: "Training data fetched successfully",
      data: trainingData
    });
  } catch (error) {
    console.error('Error fetching training data:', error.message);
    res.status(500).json({ message: "Server error while fetching training data" });
  }
};










export const ReassignTraining = async (req, res) => {
  try {
    const { assignedTo, trainingId } = req.body; // Extract trainingId and assigned users from the request body

    // Validate the data
    if (!assignedTo || !trainingId || assignedTo.length === 0) {
      return res.status(400).json({ message: "Missing assignedTo or trainingId in the request body" });
    }

    // Fetch the training using trainingId and populate the modules
    const training = await Training.findById(trainingId).populate('modules');
    if (!training) {
      return res.status(404).json({ message: "Training not found" });
    }

    // Check if modules exist
    if (!training.modules || !Array.isArray(training.modules) || training.modules.length === 0) {
      return res.status(400).json({ message: "No modules found for this training" });
    }

    // Fetch the users to assign the training to
    const users = await User.find({ _id: { $in: assignedTo } });
    if (users.length === 0) {
      return res.status(404).json({ message: "No users found matching the provided IDs" });
    }

    const deadlineDate = new Date(Date.now() + training.deadline * 24 * 60 * 60 * 1000);

    // Assign the training to each user
    const updatedUsers = users.map(async (user) => {
      // Check if the user already has the training assigned
      const existingTrainingIndex = user.training.findIndex(t => t.trainingId.toString() === trainingId);
      if (existingTrainingIndex !== -1) {
        // Remove the existing training and progress
        user.training.splice(existingTrainingIndex, 1);
        await TrainingProgress.deleteOne({ userId: user._id, trainingId: training._id });
      }

      // Reassign the training
      user.training.push({
        trainingId: training._id,
        deadline: deadlineDate, // Existing deadline
        pass: false,
        status: 'Pending',
      });

      // Create TrainingProgress for the user
      const trainingProgress = new TrainingProgress({
        userId: user._id,
        trainingId: training._id,
        deadline: deadlineDate,
        pass: false,
        modules: training.modules.map(module => ({
          moduleId: module._id,
          pass: false,
          videos: module.videos.map(video => ({
            videoId: video._id,
            pass: false,
          })),
        })),
      });

      await trainingProgress.save();
      await user.save(); // Save the updated user
    });

    await Promise.all(updatedUsers); // Wait for all users to be updated

    res.status(200).json({ message: "Training successfully reassigned to users" });
  } catch (error) {
    console.error("Error reassigning training:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const deleteTrainingController = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Delete the training from the Trainings collection
    const deletedTraining = await Training.findByIdAndDelete(id);
    if (!deletedTraining) {
      return res.status(404).json({ message: 'Training not found' });
    }

    await TrainingProgress.deleteMany({ trainingId: id });

    await User.updateMany(
      { "training.trainingId": id }, // Match users who have this training assigned
      { $pull: { training: { trainingId: id } } } // Pull the training from the user's assigned trainings
    );

    return res.status(200).json({ message: 'Training deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const MandatoryGetAllTrainingWithCompletion = async (req, res) => {
  try {
    console.log("Entered");

    // Fetch all mandatory trainings
    const trainings = await Training.find({ Trainingtype: "Mandatory" }).populate("modules");

    if (!trainings || trainings.length === 0) {
      return res.status(404).json({ message: "No training data found" });
    }

    // Process each training to calculate completion percentages
    const trainingData = await Promise.all(
      trainings.map(async (training) => {
        const progressRecords = await TrainingProgress.find({
          trainingId: training._id,
        }).populate("userId", "designation"); // Populate only 'designation' of 'userId'

        let totalUsers = 0;
        let totalPercentage = 0;
        const userProgress = []; // Store user progress for each training

        // Calculate completion percentage for each user's progress
        for (const record of progressRecords) {
          if (!record.userId) {
            console.warn(`TrainingProgress record with null userId for trainingId: ${training._id}`);
            continue; // Skip this record if userId is null
          }

          totalUsers++;

          let totalModules = 0;
          let completedModules = 0;
          let totalVideos = 0;
          let completedVideos = 0;
          const videoCompletionMap = new Map(); // To track which videos have been completed

          record.modules.forEach((module) => {
            totalModules++;

            // Count completed modules
            if (module.pass) completedModules++;

            module.videos.forEach((video) => {
              totalVideos++;

              // Track video completion by video ID
              if (video.pass && !videoCompletionMap.has(video._id.toString())) {
                completedVideos++;
                videoCompletionMap.set(video._id.toString(), true);
              }
            });
          });

          // Calculate completion percentages
          const moduleCompletion = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
          const videoCompletion = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;

          // Weighted completion percentage (40% modules, 60% videos)
          const userPercentage = moduleCompletion * 0.4 + videoCompletion * 0.6;

          totalPercentage += userPercentage;

          // Store user progress
          userProgress.push({
            userId: record.userId._id,
            designation: record.userId.designation, // Only include 'designation'
            overallCompletionPercentage: userPercentage.toFixed(2), // User's completion percentage
          });
        }

        // Calculate average completion percentage for the training
        const averageCompletionPercentage =
          totalUsers > 0 ? (totalPercentage / totalUsers).toFixed(2) : 0;

        const uniqueItems = [
          ...new Set(progressRecords.map((record) => record.userId?.designation || null)),
        ];

        return {
          trainingId: training._id,
          trainingName: training.trainingName,
          trainingTitle: training.title,
          numberOfModules: training.modules.length,
          totalUsers,
          averageCompletionPercentage, // The average completion percentage for all users
          userProgress,
          uniqueItems, // Unique designations
        };
      })
    );

    console.log(trainingData);

    // Return training data with percentages
    res.status(200).json({
      message: "Training data fetched successfully",
      data: trainingData,
    });
  } catch (error) {
    console.error("Error fetching training data:", error.message);
    res
      .status(500)
      .json({ message: "Server error while fetching training data", error: error.message });
  }
};

export const GetAllFullTrainingWithCompletion = async (req, res) => {
  try {
    // Fetch all trainings
    const trainings = await Training.find().populate('modules'); // Populate modules for reference

    if (!trainings || trainings.length === 0) {
      return res.status(404).json({ message: "No training data found" });
    }

    // Process each training to calculate completion percentages
    const trainingData = await Promise.all(
      trainings.map(async (training) => {
        const progressRecords = await TrainingProgress.find({
          trainingId: training._id
        });

        let totalUsers = 0;
        let totalPercentage = 0;
        const userProgress = []; // Store user progress for each training

        // Calculate completion percentage for each user's progress
        await Promise.all(progressRecords.map(async (record) => {
          totalUsers++;

          let totalModules = 0;
          let completedModules = 0;
          let totalVideos = 0;
          let completedVideos = 0;
          const videoCompletionMap = new Map(); // To track which videos have been completed

          record.modules.forEach((module) => {
            totalModules++;

            // Count completed modules
            if (module.pass) completedModules++;

            module.videos.forEach((video) => {
              totalVideos++;

              // Track the video completion by video ID, ensuring each video is only counted once
              if (video.pass && !videoCompletionMap.has(video._id.toString())) {
                completedVideos++;
                videoCompletionMap.set(video._id.toString(), true);
              }
            });
          });

          // Calculate the completion percentages based on module and video completion
          const moduleCompletion = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
          const videoCompletion = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;

          // The user's overall completion percentage is weighted (40% for modules, 60% for videos)
          const userPercentage = (moduleCompletion * 0.4) + (videoCompletion * 0.6);

          totalPercentage += userPercentage;

          // Store user progress for each user
          userProgress.push({
            userId: record.userId,
            username: record.username,
            email: record.email,
            modules: record.modules,
            overallCompletionPercentage: userPercentage.toFixed(2), // User's completion percentage
          });
        }));

        // Calculate average completion percentage for the training based on all users
        const averageCompletionPercentage = totalUsers > 0 ? (totalPercentage / totalUsers).toFixed(2) : 0;

        return {
          trainingId: training._id,
          trainingName: training.trainingName,
          trainingTitle: training.title,
          numberOfModules: training.modules.length,
          totalUsers,
          averageCompletionPercentage, // The average completion percentage for all users
          userProgress // Return the detailed user progress
        };
      })
    );

    // Return training data with percentages
    res.status(200).json({
      message: "Training data fetched successfully",
      data: trainingData
    });
  } catch (error) {
    console.error('Error fetching training data:', error.message);
    res.status(500).json({ message: "Server error while fetching training data" });
  }
};


export const GetAssessment = async (req, res) => {
  try {
    const assessments = await Assessment.find(); // Fetch all assessments
    const users = await User.find(); // Fetch all users

    const results = [];

    for (const assess of assessments) {
      let totalAssigned = 0;
      let totalPassed = 0;

      for (const user of users) {
        const assigned = user.assignedAssessments.find(
          (assignment) => assignment.assessmentId.toString() === assess._id.toString()
        );

        if (assigned) {
          totalAssigned++;

          if (assigned.pass) {
            totalPassed++;
          }
        }
      }

      const completionPercentage = totalAssigned
        ? ((totalPassed / totalAssigned) * 100).toFixed(2)
        : 0;


      results.push({
        assessmentId: assess._id,
        assessmentName: assess.title,
        assessment: assess.questions.length,
        assessmentdeadline: assess.deadline,
        assessmentduration: assess.duration,
        totalAssigned,
        totalPassed,
        completionPercentage: completionPercentage,
      });
    }

    res.status(200).json({
      message: 'Assessments retrieved successfully.',
      data: results,
    });
  } catch (error) {
    console.error('Error retrieving assessments:', error);
    res.status(500).json({
      message: 'An error occurred while retrieving the assessments.',
      error: error.message,
    });
  }
};

