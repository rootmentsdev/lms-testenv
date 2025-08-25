import React from 'react';
import { FaPlay, FaCheck, FaLock, FaVideo } from 'react-icons/fa';

const TrainingProgress = ({ modules = [], onModuleClick }) => {
  const getModuleStatus = (module) => {
    if (module.status === 'Completed') return 'completed';
    if (module.status === 'In Progress') return 'in-progress';
    return 'locked';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheck className="w-5 h-5 text-green-600" />;
      case 'in-progress':
        return <FaPlay className="w-5 h-5 text-blue-600" />;
      case 'locked':
        return <FaLock className="w-5 h-5 text-gray-400" />;
      default:
        return <FaLock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'in-progress':
        return 'border-blue-500 bg-blue-50';
      case 'locked':
        return 'border-gray-300 bg-gray-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getProgressPercentage = () => {
    if (modules.length === 0) return 0;
    const completedModules = modules.filter(module => module.status === 'Completed').length;
    return Math.round((completedModules / modules.length) * 100);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Training Progress</h3>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-semibold text-blue-600">{getProgressPercentage()}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{modules.filter(m => m.status === 'Completed').length} of {modules.length} modules completed</span>
        </div>
      </div>

      <div className="space-y-4">
        {modules.map((module, index) => {
          const status = getModuleStatus(module);
          const isClickable = status !== 'locked';
          
          return (
            <div
              key={module._id || index}
              className={`border-2 rounded-lg p-4 transition-all duration-200 ${
                getStatusColor(status)
              } ${isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-not-allowed'}`}
              onClick={() => isClickable && onModuleClick(module)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getStatusIcon(status)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {module.moduleName || `Module ${index + 1}`}
                    </h4>
                    {module.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {module.description}
                      </p>
                    )}
                    {module.videos && module.videos.length > 0 && (
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <FaVideo className="mr-1" />
                        <span>{module.videos.length} video{module.videos.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    status === 'completed' ? 'text-green-600' :
                    status === 'in-progress' ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {status === 'completed' ? 'Completed' :
                     status === 'in-progress' ? 'In Progress' : 'Locked'}
                  </div>
                  {module.status === 'In Progress' && module.progress && (
                    <div className="text-xs text-gray-500 mt-1">
                      {module.progress}% complete
                    </div>
                  )}
                </div>
              </div>

              {/* Module Progress Bar */}
              {module.status === 'In Progress' && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{module.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${module.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Video List */}
              {module.videos && module.videos.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="space-y-2">
                    {module.videos.map((video, videoIndex) => (
                      <div key={videoIndex} className="flex items-center space-x-2 text-sm">
                        <FaVideo className="text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700 flex-1">{video.title}</span>
                        {video.completed && (
                          <FaCheck className="text-green-600 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {modules.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FaVideo className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p>No modules available for this training.</p>
        </div>
      )}
    </div>
  );
};

export default TrainingProgress;
