import React, { useState, useEffect } from 'react';
import { FaPlay, FaCheck, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import TrainingCard from './TrainingCard';
import TrainingProgress from './TrainingProgress';
import { getAssignedTrainings, getMandatoryTrainings } from '../../api/trainingApi';

const TrainingDashboard = () => {
  const [activeTab, setActiveTab] = useState('assigned');
  const [assignedTrainings, setAssignedTrainings] = useState([]);
  const [mandatoryTrainings, setMandatoryTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    fetchTrainings();
  }, []);

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const [assignedData, mandatoryData] = await Promise.all([
        getAssignedTrainings(),
        getMandatoryTrainings()
      ]);
      
      setAssignedTrainings(assignedData.data || []);
      setMandatoryTrainings(mandatoryData.data || []);
    } catch (err) {
      setError('Failed to fetch trainings');
      console.error('Error fetching trainings:', err);
    } finally {
      setLoading(false);
    }
  };

  const getOverdueTrainings = (trainings) => {
    const now = new Date();
    return trainings.filter(training => {
      const deadline = new Date(training.deadline);
      return deadline < now && training.status !== 'Completed';
    });
  };

  const getCurrentTrainings = (trainings) => {
    const now = new Date();
    return trainings.filter(training => {
      const deadline = new Date(training.deadline);
      return deadline >= now && training.status !== 'Completed';
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={fetchTrainings}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentAssignedTrainings = getCurrentTrainings(assignedTrainings);
  const overdueAssignedTrainings = getOverdueTrainings(assignedTrainings);
  const currentMandatoryTrainings = getCurrentTrainings(mandatoryTrainings);
  const overdueMandatoryTrainings = getOverdueTrainings(mandatoryTrainings);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button className="mr-4 text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Trainings</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('assigned')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'assigned'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Assigned
            </button>
            <button
              onClick={() => setActiveTab('mandatory')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'mandatory'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mandatory
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'assigned' ? (
          <div>
            {/* Overdue Trainings */}
            {overdueAssignedTrainings.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Overdue Trainings</h2>
                <div className="space-y-4">
                  {overdueAssignedTrainings.map((training) => (
                    <TrainingCard 
                      key={training._id} 
                      training={training} 
                      isOverdue={true}
                      onRefresh={fetchTrainings}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Current Trainings */}
            {currentAssignedTrainings.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Trainings</h2>
                <div className="space-y-4">
                  {currentAssignedTrainings.map((training) => (
                    <TrainingCard 
                      key={training._id} 
                      training={training} 
                      isOverdue={false}
                      onRefresh={fetchTrainings}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* No Trainings */}
            {assignedTrainings.length === 0 && (
              <div className="text-center py-12">
                <FaCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No assigned trainings at the moment.</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Overdue Mandatory Trainings */}
            {overdueMandatoryTrainings.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Overdue Trainings</h2>
                <div className="space-y-4">
                  {overdueMandatoryTrainings.map((training) => (
                    <TrainingCard 
                      key={training._id} 
                      training={training} 
                      isOverdue={true}
                      onRefresh={fetchTrainings}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Current Mandatory Trainings */}
            {currentMandatoryTrainings.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Trainings</h2>
                <div className="space-y-4">
                  {currentMandatoryTrainings.map((training) => (
                    <TrainingCard 
                      key={training._id} 
                      training={training} 
                      isOverdue={false}
                      onRefresh={fetchTrainings}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* No Mandatory Trainings */}
            {mandatoryTrainings.length === 0 && (
              <div className="text-center py-12">
                <FaCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No mandatory trainings at the moment.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-around py-3">
            <button className="flex flex-col items-center text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs">Home</span>
            </button>
            <button className="flex flex-col items-center text-blue-600">
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-xs">Training</span>
            </button>
            <button className="flex flex-col items-center text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xs">Assessment</span>
            </button>
            <button className="flex flex-col items-center text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs">Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingDashboard;
