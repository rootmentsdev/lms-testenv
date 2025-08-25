import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlay, FaCheck, FaLock, FaVideo, FaQuestionCircle } from 'react-icons/fa';
import { getTrainingById, startTraining, updateTrainingProgress, completeModule } from '../../api/trainingApi';
import TrainingProgress from '../../components/TrainingDashboard/TrainingProgress';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';
import AssessmentModal from '../../components/AssessmentModal/AssessmentModal';

const TrainingDetail = () => {
  const { trainingId } = useParams();
  const navigate = useNavigate();
  const [training, setTraining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showAssessment, setShowAssessment] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  useEffect(() => {
    fetchTrainingDetails();
  }, [trainingId]);

  const fetchTrainingDetails = async () => {
    try {
      setLoading(true);
      const data = await getTrainingById(trainingId);
      setTraining(data.data || data);
    } catch (err) {
      setError('Failed to fetch training details');
      console.error('Error fetching training details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTraining = async () => {
    try {
      await startTraining(trainingId);
      fetchTrainingDetails(); // Refresh data
    } catch (error) {
      console.error('Error starting training:', error);
    }
  };

  const handleModuleClick = (module) => {
    setSelectedModule(module);
    if (module.videos && module.videos.length > 0) {
      setSelectedVideo(module.videos[0]);
      setCurrentVideoIndex(0);
    }
  };

  const handleVideoComplete = async () => {
    if (!selectedModule || !selectedVideo) return;

    try {
      // Update progress for the current video
      const videoProgress = ((currentVideoIndex + 1) / selectedModule.videos.length) * 100;
      await updateTrainingProgress(trainingId, selectedModule._id, videoProgress);

      // Move to next video or complete module
      if (currentVideoIndex < selectedModule.videos.length - 1) {
        setCurrentVideoIndex(currentVideoIndex + 1);
        setSelectedVideo(selectedModule.videos[currentVideoIndex + 1]);
      } else {
        // Module completed, show assessment if available
        if (selectedModule.questions && selectedModule.questions.length > 0) {
          setShowAssessment(true);
        } else {
          // Complete module without assessment
          await completeModule(trainingId, selectedModule._id);
          fetchTrainingDetails();
        }
      }
    } catch (error) {
      console.error('Error updating video progress:', error);
    }
  };

  const handleAssessmentComplete = async (answers) => {
    try {
      // Submit assessment and complete module
      // This would call the assessment submission API
      await completeModule(trainingId, selectedModule._id);
      setShowAssessment(false);
      fetchTrainingDetails();
    } catch (error) {
      console.error('Error completing assessment:', error);
    }
  };

  const handleVideoChange = (videoIndex) => {
    if (selectedModule && selectedModule.videos[videoIndex]) {
      setSelectedVideo(selectedModule.videos[videoIndex]);
      setCurrentVideoIndex(videoIndex);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !training) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{error || 'Training not found'}</p>
          <button 
            onClick={() => navigate('/trainings')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Trainings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/trainings')}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                <FaArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {training.trainingName || 'Training Details'}
              </h1>
            </div>
            {training.status === 'Pending' && (
              <button
                onClick={handleStartTraining}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Start Training
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Training Info and Progress */}
          <div className="lg:col-span-1 space-y-6">
            {/* Training Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Training Information</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Name:</span>
                  <p className="text-gray-900">{training.trainingName || 'N/A'}</p>
                </div>
                {training.description && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Description:</span>
                    <p className="text-gray-900">{training.description}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    training.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    training.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {training.status}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Deadline:</span>
                  <p className="text-gray-900">
                    {new Date(training.deadline).toLocaleDateString()}
                  </p>
                </div>
                {training.modules && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Modules:</span>
                    <p className="text-gray-900">{training.modules.length}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Training Progress */}
            {training.modules && (
              <TrainingProgress 
                modules={training.modules} 
                onModuleClick={handleModuleClick}
              />
            )}
          </div>

          {/* Right Column - Video Player and Module Content */}
          <div className="lg:col-span-2 space-y-6">
            {selectedModule ? (
              <div>
                {/* Module Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedModule.moduleName}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedModule.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      selectedModule.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedModule.status}
                    </span>
                  </div>
                  
                  {selectedModule.description && (
                    <p className="text-gray-600 mb-4">{selectedModule.description}</p>
                  )}

                  {/* Video Navigation */}
                  {selectedModule.videos && selectedModule.videos.length > 0 && (
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {selectedModule.videos.map((video, index) => (
                        <button
                          key={index}
                          onClick={() => handleVideoChange(index)}
                          className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            index === currentVideoIndex
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <FaVideo className="mr-2" />
                          Video {index + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Video Player */}
                {selectedVideo && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      {selectedVideo.title}
                    </h4>
                    <VideoPlayer
                      videoUrl={selectedVideo.videoUri}
                      onComplete={handleVideoComplete}
                      onProgress={(progress) => {
                        // Handle video progress updates
                        console.log('Video progress:', progress);
                      }}
                    />
                  </div>
                )}

                {/* Module Questions/Assessment */}
                {selectedModule.questions && selectedModule.questions.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">Assessment</h4>
                      <FaQuestionCircle className="text-gray-400" />
                    </div>
                    <p className="text-gray-600 mb-4">
                      This module includes {selectedModule.questions.length} questions to test your understanding.
                    </p>
                    <button
                      onClick={() => setShowAssessment(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Take Assessment
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center py-12">
                <FaVideo className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">Select a module to start learning</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assessment Modal */}
      {showAssessment && selectedModule && (
        <AssessmentModal
          questions={selectedModule.questions}
          onComplete={handleAssessmentComplete}
          onClose={() => setShowAssessment(false)}
        />
      )}
    </div>
  );
};

export default TrainingDetail;
