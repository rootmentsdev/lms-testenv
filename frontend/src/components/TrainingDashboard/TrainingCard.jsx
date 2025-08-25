import React, { useState } from 'react';
import { FaPlay, FaCheck, FaClock, FaExclamationTriangle, FaEye } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const TrainingCard = ({ training, isOverdue, onRefresh }) => {
  const [isLoading, setIsLoading] = useState(false);

  const calculateDaysLeft = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgressPercentage = (training) => {
    if (!training.modules || training.modules.length === 0) return 0;
    
    const completedModules = training.modules.filter(module => 
      module.status === 'Completed'
    ).length;
    
    return Math.round((completedModules / training.modules.length) * 100);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'text-green-600 bg-green-100';
      case 'In Progress':
        return 'text-blue-600 bg-blue-100';
      case 'Pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const daysLeft = calculateDaysLeft(training.deadline);
  const progressPercentage = getProgressPercentage(training);

  const handleStartTraining = async () => {
    setIsLoading(true);
    try {
      // Update training status to 'In Progress' if it's currently 'Pending'
      if (training.status === 'Pending') {
        // API call to update status would go here
        console.log('Starting training:', training._id);
      }
    } catch (error) {
      console.error('Error starting training:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {training.trainingName || training.trainingId?.trainingName || 'Training Name'}
          </h3>
          
          {training.description && (
            <p className="text-gray-600 text-sm mb-3">
              {training.description}
            </p>
          )}
          
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center">
              <FaClock className="mr-1" />
              <span>Deadline: {new Date(training.deadline).toLocaleDateString()}</span>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(training.status)}`}>
              {training.status}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          {isOverdue ? (
            <div className="text-red-600 font-semibold text-sm">
              0 Days Left
            </div>
          ) : (
            <div className={`font-semibold text-sm ${daysLeft <= 3 ? 'text-orange-600' : 'text-gray-600'}`}>
              {daysLeft} Days Left
            </div>
          )}
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-semibold text-blue-600">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        {training.status === 'Completed' ? (
          <div className="flex items-center text-green-600 text-sm">
            <FaCheck className="mr-2" />
            <span>Training Completed</span>
          </div>
        ) : (
          <>
            <button
              onClick={handleStartTraining}
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <FaPlay className="mr-2" />
                  {training.status === 'In Progress' ? 'Continue' : 'Start Training'}
                </>
              )}
            </button>
            
            <Link
              to={`/training/${training._id}`}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center"
            >
              <FaEye className="mr-2" />
              View
            </Link>
          </>
        )}
      </div>

      {/* Overdue Warning */}
      {isOverdue && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-red-700">
            <FaExclamationTriangle className="mr-2" />
            <span className="text-sm font-medium">This training is overdue. Please complete it as soon as possible.</span>
          </div>
        </div>
      )}

      {/* Training Details */}
      {training.modules && training.modules.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Modules: {training.modules.length}</span>
            <span>Completed: {training.modules.filter(m => m.status === 'Completed').length}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingCard;
