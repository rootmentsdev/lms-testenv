
import User from '../model/User.js';

// Function to assign a module to a user
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

// Function to assign an assessment to a user
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
