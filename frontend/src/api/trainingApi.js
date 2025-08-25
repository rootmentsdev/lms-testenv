import api from './api';

// Get assigned trainings for the current user
export const getAssignedTrainings = async () => {
  try {
    const response = await api.get('/api/user/trainings/assigned');
    return response.data;
  } catch (error) {
    console.error('Error fetching assigned trainings:', error);
    throw error;
  }
};

// Get mandatory trainings for the current user
export const getMandatoryTrainings = async () => {
  try {
    const response = await api.get('/api/user/trainings/mandatory');
    return response.data;
  } catch (error) {
    console.error('Error fetching mandatory trainings:', error);
    throw error;
  }
};

// Get training details by ID
export const getTrainingById = async (trainingId) => {
  try {
    const response = await api.get(`/api/user/training/${trainingId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching training details:', error);
    throw error;
  }
};

// Start a training (update status to 'In Progress')
export const startTraining = async (trainingId) => {
  try {
    const response = await api.put(`/api/user/training/${trainingId}/start`);
    return response.data;
  } catch (error) {
    console.error('Error starting training:', error);
    throw error;
  }
};

// Update training progress
export const updateTrainingProgress = async (trainingId, moduleId, progress) => {
  try {
    const response = await api.put(`/api/user/training/${trainingId}/progress`, {
      moduleId,
      progress
    });
    return response.data;
  } catch (error) {
    console.error('Error updating training progress:', error);
    throw error;
  }
};

// Complete a training module
export const completeModule = async (trainingId, moduleId) => {
  try {
    const response = await api.put(`/api/user/training/${trainingId}/module/${moduleId}/complete`);
    return response.data;
  } catch (error) {
    console.error('Error completing module:', error);
    throw error;
  }
};

// Complete a training
export const completeTraining = async (trainingId) => {
  try {
    const response = await api.put(`/api/user/training/${trainingId}/complete`);
    return response.data;
  } catch (error) {
    console.error('Error completing training:', error);
    throw error;
  }
};

// Get user's training statistics
export const getTrainingStats = async () => {
  try {
    const response = await api.get('/api/user/trainings/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching training stats:', error);
    throw error;
  }
};

// Get overdue trainings
export const getOverdueTrainings = async () => {
  try {
    const response = await api.get('/api/user/trainings/overdue');
    return response.data;
  } catch (error) {
    console.error('Error fetching overdue trainings:', error);
    throw error;
  }
};

// Get upcoming trainings
export const getUpcomingTrainings = async () => {
  try {
    const response = await api.get('/api/user/trainings/upcoming');
    return response.data;
  } catch (error) {
    console.error('Error fetching upcoming trainings:', error);
    throw error;
  }
};

// Submit training assessment
export const submitTrainingAssessment = async (trainingId, moduleId, answers) => {
  try {
    const response = await api.post(`/api/user/training/${trainingId}/module/${moduleId}/assessment`, {
      answers
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting assessment:', error);
    throw error;
  }
};

// Get training certificate
export const getTrainingCertificate = async (trainingId) => {
  try {
    const response = await api.get(`/api/user/training/${trainingId}/certificate`);
    return response.data;
  } catch (error) {
    console.error('Error fetching training certificate:', error);
    throw error;
  }
};
