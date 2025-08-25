import User from '../model/User.js';
import { Training } from '../model/Traning.js';
import Module from '../model/Module.js';

// Get assigned trainings for the current user
export const getAssignedTrainings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId).populate({
      path: 'training.trainingId',
      populate: {
        path: 'modules',
        populate: {
          path: 'videos'
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    const assignedTrainings = user.training || [];

    res.status(200).json({
      status: 'success',
      data: assignedTrainings
    });
  } catch (error) {
    console.error('Error fetching assigned trainings:', error);
    res.status(500).json({
      status: 'fail',
      message: 'Internal server error'
    });
  }
};

// Get mandatory trainings for the current user
export const getMandatoryTrainings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId).populate({
      path: 'training.trainingId',
      match: { Trainingtype: 'Mandatory' },
      populate: {
        path: 'modules',
        populate: {
          path: 'videos'
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    const mandatoryTrainings = user.training.filter(t => t.trainingId && t.trainingId.Trainingtype === 'Mandatory') || [];

    res.status(200).json({
      status: 'success',
      data: mandatoryTrainings
    });
  } catch (error) {
    console.error('Error fetching mandatory trainings:', error);
    res.status(500).json({
      status: 'fail',
      message: 'Internal server error'
    });
  }
};

// Get training details by ID
export const getTrainingById = async (req, res) => {
  try {
    const { trainingId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId).populate({
      path: 'training.trainingId',
      match: { _id: trainingId },
      populate: {
        path: 'modules',
        populate: {
          path: 'videos'
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    const training = user.training.find(t => t.trainingId && t.trainingId._id.toString() === trainingId);

    if (!training) {
      return res.status(404).json({
        status: 'fail',
        message: 'Training not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: training
    });
  } catch (error) {
    console.error('Error fetching training details:', error);
    res.status(500).json({
      status: 'fail',
      message: 'Internal server error'
    });
  }
};

// Start a training (update status to 'In Progress')
export const startTraining = async (req, res) => {
  try {
    const { trainingId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    const trainingIndex = user.training.findIndex(t => t.trainingId.toString() === trainingId);
    if (trainingIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Training not found'
      });
    }

    if (user.training[trainingIndex].status === 'In Progress') {
      return res.status(400).json({
        status: 'fail',
        message: 'Training is already in progress'
      });
    }

    user.training[trainingIndex].status = 'In Progress';
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Training started successfully'
    });
  } catch (error) {
    console.error('Error starting training:', error);
    res.status(500).json({
      status: 'fail',
      message: 'Internal server error'
    });
  }
};

// Update training progress
export const updateTrainingProgress = async (req, res) => {
  try {
    const { trainingId } = req.params;
    const { moduleId, progress } = req.body;
    const userId = req.user.id;

    if (!moduleId || progress === undefined) {
      return res.status(400).json({
        status: 'fail',
        message: 'Module ID and progress are required'
      });
    }

    if (progress < 0 || progress > 100) {
      return res.status(400).json({
        status: 'fail',
        message: 'Progress must be between 0 and 100'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    const trainingIndex = user.training.findIndex(t => t.trainingId.toString() === trainingId);
    if (trainingIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Training not found'
      });
    }

    // Update module progress
    const moduleIndex = user.training[trainingIndex].modules.findIndex(m => m.moduleId.toString() === moduleId);
    if (moduleIndex !== -1) {
      user.training[trainingIndex].modules[moduleIndex].progress = progress;
      
      // Update module status based on progress
      if (progress >= 100) {
        user.training[trainingIndex].modules[moduleIndex].status = 'Completed';
      } else if (progress > 0) {
        user.training[trainingIndex].modules[moduleIndex].status = 'In Progress';
      }
    }

    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Progress updated successfully'
    });
  } catch (error) {
    console.error('Error updating training progress:', error);
    res.status(500).json({
      status: 'fail',
      message: 'Internal server error'
    });
  }
};

// Complete a training module
export const completeModule = async (req, res) => {
  try {
    const { trainingId, moduleId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    const trainingIndex = user.training.findIndex(t => t.trainingId.toString() === trainingId);
    if (trainingIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Training not found'
      });
    }

    const moduleIndex = user.training[trainingIndex].modules.findIndex(m => m.moduleId.toString() === moduleId);
    if (moduleIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Module not found'
      });
    }

    // Mark module as completed
    user.training[trainingIndex].modules[moduleIndex].status = 'Completed';
    user.training[trainingIndex].modules[moduleIndex].progress = 100;

    // Check if all modules are completed
    const allModulesCompleted = user.training[trainingIndex].modules.every(m => m.status === 'Completed');
    if (allModulesCompleted) {
      user.training[trainingIndex].status = 'Completed';
    }

    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Module completed successfully'
    });
  } catch (error) {
    console.error('Error completing module:', error);
    res.status(500).json({
      status: 'fail',
      message: 'Internal server error'
    });
  }
};

// Complete a training
export const completeTraining = async (req, res) => {
  try {
    const { trainingId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    const trainingIndex = user.training.findIndex(t => t.trainingId.toString() === trainingId);
    if (trainingIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Training not found'
      });
    }

    // Mark training as completed
    user.training[trainingIndex].status = 'Completed';
    
    // Mark all modules as completed
    user.training[trainingIndex].modules.forEach(module => {
      module.status = 'Completed';
      module.progress = 100;
    });

    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Training completed successfully'
    });
  } catch (error) {
    console.error('Error completing training:', error);
    res.status(500).json({
      status: 'fail',
      message: 'Internal server error'
    });
  }
};

// Get training statistics
export const getTrainingStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    const trainings = user.training || [];
    const totalTrainings = trainings.length;
    const completedTrainings = trainings.filter(t => t.status === 'Completed').length;
    const inProgressTrainings = trainings.filter(t => t.status === 'In Progress').length;
    const pendingTrainings = trainings.filter(t => t.status === 'Pending').length;

    let overallProgress = 0;
    if (totalTrainings > 0) {
      const totalProgress = trainings.reduce((sum, training) => {
        if (training.modules && training.modules.length > 0) {
          const moduleProgress = training.modules.reduce((moduleSum, module) => {
            return moduleSum + (module.progress || 0);
          }, 0);
          return sum + (moduleProgress / training.modules.length);
        }
        return sum + (training.status === 'Completed' ? 100 : 0);
      }, 0);
      overallProgress = Math.round(totalProgress / totalTrainings);
    }

    res.status(200).json({
      status: 'success',
      data: {
        totalTrainings,
        completedTrainings,
        inProgressTrainings,
        pendingTrainings,
        overallProgress
      }
    });
  } catch (error) {
    console.error('Error fetching training stats:', error);
    res.status(500).json({
      status: 'fail',
      message: 'Internal server error'
    });
  }
};

// Get overdue trainings
export const getOverdueTrainings = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const user = await User.findById(userId).populate('training.trainingId');
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    const overdueTrainings = user.training.filter(training => {
      const deadline = new Date(training.deadline);
      return deadline < now && training.status !== 'Completed';
    });

    res.status(200).json({
      status: 'success',
      data: overdueTrainings
    });
  } catch (error) {
    console.error('Error fetching overdue trainings:', error);
    res.status(500).json({
      status: 'fail',
      message: 'Internal server error'
    });
  }
};

// Get upcoming trainings
export const getUpcomingTrainings = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));

    const user = await User.findById(userId).populate('training.trainingId');
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    const upcomingTrainings = user.training.filter(training => {
      const deadline = new Date(training.deadline);
      return deadline > now && deadline <= thirtyDaysFromNow && training.status !== 'Completed';
    });

    res.status(200).json({
      status: 'success',
      data: upcomingTrainings
    });
  } catch (error) {
    console.error('Error fetching upcoming trainings:', error);
    res.status(500).json({
      status: 'fail',
      message: 'Internal server error'
    });
  }
};

// Submit training assessment
export const submitTrainingAssessment = async (req, res) => {
  try {
    const { trainingId, moduleId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({
        status: 'fail',
        message: 'Answers are required'
      });
    }

    // Get the module to check questions
    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({
        status: 'fail',
        message: 'Module not found'
      });
    }

    // Calculate score
    let correctAnswers = 0;
    const totalQuestions = module.questions.length;

    module.questions.forEach(question => {
      if (answers[question._id] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // Update user's training progress
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    const trainingIndex = user.training.findIndex(t => t.trainingId.toString() === trainingId);
    if (trainingIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Training not found'
      });
    }

    const moduleIndex = user.training[trainingIndex].modules.findIndex(m => m.moduleId.toString() === moduleId);
    if (moduleIndex !== -1) {
      user.training[trainingIndex].modules[moduleIndex].assessmentScore = score;
      user.training[trainingIndex].modules[moduleIndex].assessmentCompleted = true;
    }

    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Assessment submitted successfully',
      score
    });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    res.status(500).json({
      status: 'fail',
      message: 'Internal server error'
    });
  }
};

// Get training certificate
export const getTrainingCertificate = async (req, res) => {
  try {
    const { trainingId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    const training = user.training.find(t => t.trainingId.toString() === trainingId);
    if (!training) {
      return res.status(404).json({
        status: 'fail',
        message: 'Training not found'
      });
    }

    if (training.status !== 'Completed') {
      return res.status(400).json({
        status: 'fail',
        message: 'Training must be completed to generate certificate'
      });
    }

    // Generate certificate URL (this would typically generate a PDF or redirect to a certificate service)
    const certificateUrl = `/api/certificates/${trainingId}/${userId}`;

    res.status(200).json({
      status: 'success',
      data: {
        certificateUrl
      }
    });
  } catch (error) {
    console.error('Error fetching training certificate:', error);
    res.status(500).json({
      status: 'fail',
      message: 'Internal server error'
    });
  }
};
