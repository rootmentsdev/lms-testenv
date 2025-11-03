/**
 * Assessments Data Component
 * 
 * Displays all assessments with completion statistics
 * Supports creating new assessments, assigning assessments, and managing Google Forms
 * 
 * @returns {JSX.Element} - Assessments data component
 */
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaExternalLinkAlt } from "react-icons/fa";

import Header from "../../components/Header/Header";
import SideNav from "../../components/SideNav/SideNav";
import RoundProgressBarAssessment from "../../components/RoundBar/RoundAssessment";
import GoogleFormManager from "../../components/GoogleFormManager/GoogleFormManager";
import API_CONFIG from "../../api/api";

/**
 * API endpoints
 */
const API_ENDPOINTS = {
    GET_ALL_ASSESSMENTS: 'api/user/get/AllAssessment',
    GET_ACTIVE_GOOGLE_FORM: 'api/google-form/active',
    DEACTIVATE_GOOGLE_FORM: 'api/google-form/deactivate',
    UPDATE_GOOGLE_FORM: 'api/google-form',
};

/**
 * Route paths
 */
const ROUTE_PATHS = {
    CREATE_ASSESSMENT: '/create/Assessment',
    ASSIGN_ASSESSMENT: '/assign/Assessment',
    ASSESSMENT_ASSIGN: (assessmentId) => `/Assessment/Assign/${assessmentId}`,
};

/**
 * Retrieves authentication token from localStorage safely
 * 
 * @returns {string|null} - Authentication token or null
 */
const getAuthToken = () => {
    try {
        return localStorage.getItem('token');
    } catch (error) {
        console.error('Failed to retrieve auth token:', error);
        return null;
    }
};

/**
 * Builds authorization headers for API requests
 * 
 * @returns {Object} - Headers object
 */
const buildAuthHeaders = () => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

/**
 * Assessments Data Component
 */
const AssessmentsData = () => {
    const [assessments, setAssessments] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showGoogleFormManager, setShowGoogleFormManager] = useState(false);
    const [activeGoogleForm, setActiveGoogleForm] = useState(null);
    const [isTogglingForm, setIsTogglingForm] = useState(false);

    /**
     * Fetches all assessments data
     */
    const fetchAssessments = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_ENDPOINTS.GET_ALL_ASSESSMENTS}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            // Sort data by completionPercentage in ascending order
            const sortedData = (result.data || []).sort(
                (a, b) => (a.completionPercentage || 0) - (b.completionPercentage || 0)
            );

            setAssessments(sortedData);
        } catch (error) {
            console.error('Error fetching assessments:', error);
            setError('Failed to load assessments');
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Fetches active Google Form data
     */
    const fetchActiveGoogleForm = useCallback(async () => {
        const token = getAuthToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_ENDPOINTS.GET_ACTIVE_GOOGLE_FORM}`, {
                headers: buildAuthHeaders(),
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    setActiveGoogleForm(result.data);
                }
            }
        } catch (error) {
            console.error('Error fetching active Google Form:', error);
        }
    }, []);

    /**
     * Toggles active/inactive status of Google Form
     */
    const handleToggleActive = useCallback(async () => {
        if (!activeGoogleForm) return;

        setIsTogglingForm(true);
        const token = getAuthToken();

        try {
            if (activeGoogleForm.isActive) {
                // Deactivate the form
                const response = await fetch(
                    `${API_CONFIG.baseUrl}${API_ENDPOINTS.DEACTIVATE_GOOGLE_FORM}`,
                    {
                        method: 'PUT',
                        headers: buildAuthHeaders(),
                    }
                );

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        setActiveGoogleForm((prev) => ({
                            ...prev,
                            isActive: false,
                        }));
                    }
                }
            } else {
                // Reactivate the form by updating it
                const response = await fetch(
                    `${API_CONFIG.baseUrl}${API_ENDPOINTS.UPDATE_GOOGLE_FORM}`,
                    {
                        method: 'POST',
                        headers: buildAuthHeaders(),
                        body: JSON.stringify({
                            title: activeGoogleForm.title,
                            url: activeGoogleForm.url,
                            description: activeGoogleForm.description,
                        }),
                    }
                );

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        setActiveGoogleForm((prev) => ({
                            ...prev,
                            isActive: true,
                        }));
                    }
                }
            }
        } catch (error) {
            console.error('Error toggling form status:', error);
        } finally {
            setIsTogglingForm(false);
        }
    }, [activeGoogleForm]);

    /**
     * Handles Google Form Manager modal close
     */
    const handleGoogleFormManagerClose = useCallback(() => {
        setShowGoogleFormManager(false);
        fetchActiveGoogleForm();
    }, [fetchActiveGoogleForm]);

    useEffect(() => {
        fetchAssessments();
        fetchActiveGoogleForm();
    }, [fetchAssessments, fetchActiveGoogleForm]);

    return (
        <div className="w-full h-full bg-white">
            <Header name="Assessments" />
            <SideNav />

            <div className="md:ml-[100px] mt-[150px]">
                {/* Top Bar Actions */}
                <div className="flex md:mx-10 justify-between mt-10">
                    <Link to={ROUTE_PATHS.CREATE_ASSESSMENT}>
                        <div className="flex w-56 border-2 justify-evenly items-center py-2 ml-10 cursor-pointer hover:bg-gray-50 transition-colors">
                            <div className="text-[#016E5B]">
                                <FaPlus />
                            </div>
                            <h4 className="text-black font-medium">Create New Assessment</h4>
                        </div>
                    </Link>
                    
                    <Link to={ROUTE_PATHS.ASSIGN_ASSESSMENT}>
                        <div className="flex w-56 border-2 justify-evenly items-center py-2 ml-10 cursor-pointer hover:bg-gray-50 transition-colors">
                            <div className="text-[#016E5B]">
                                <FaPlus />
                            </div>
                            <h4 className="text-black font-medium">Assign Assessment</h4>
                        </div>
                    </Link>

                    {/* Google Form Management Button */}
                    <button
                        type="button"
                        onClick={() => setShowGoogleFormManager(true)}
                        className="group flex w-56 border-2 border-green-600 justify-evenly items-center py-3 ml-10 cursor-pointer bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-200 rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                    >
                        <div className="text-green-600 group-hover:text-green-700 transition-colors">
                            <FaExternalLinkAlt className="text-lg" />
                        </div>
                        <h4 className="text-green-700 font-semibold group-hover:text-green-800 transition-colors">
                            Manage Google Form
                        </h4>
                    </button>
                </div>

                {/* Assessment Cards */}
                <div className="mt-10 ml-10 flex flex-wrap gap-3">
                    {isLoading ? (
                        <div className="w-full text-center py-8 text-gray-500">Loading assessments...</div>
                    ) : error ? (
                        <div className="w-full text-center py-8 text-red-500">{error}</div>
                    ) : assessments.length === 0 ? (
                        <div className="w-full text-center py-8 text-gray-500">
                            No assessments found. Create your first assessment!
                        </div>
                    ) : (
                        assessments.map((assessment) => (
                            <Link 
                                to={ROUTE_PATHS.ASSESSMENT_ASSIGN(assessment?.assessmentId)} 
                                key={assessment.assessmentId}
                            >
                                <div className="mt-5">
                                    <RoundProgressBarAssessment
                                        initialProgress={assessment.completionPercentage || 0}
                                        deadline={`${assessment?.assessmentdeadline || 0} days`}
                                        user={assessment.totalAssigned || 0}
                                        duration={assessment.assessmentduration || 0}
                                        Module={`Number of questions: ${assessment?.assessment || 0}`}
                                        title={assessment?.assessmentName || 'Untitled Assessment'}
                                        complete={`Complete rate ${assessment.completionPercentage || 0}%`}
                                    />
                                </div>
                            </Link>
                        ))
                    )}
                </div>

                {/* Active Google Form Display */}
                {activeGoogleForm && (
                    <div className="mt-8 ml-10 mr-10">
                        <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 border border-green-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-gradient-to-r from-green-500 to-blue-500 p-3 rounded-full shadow-md">
                                        <FaExternalLinkAlt className="text-white text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-green-800 mb-1">
                                            Active Google Form Assessment
                                        </h3>
                                        <p className="text-green-600 text-sm">
                                            Currently displayed in your LMS training app
                                        </p>
                                    </div>
                                </div>
                                <div className={`px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${
                                    activeGoogleForm.isActive 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {activeGoogleForm.isActive ? '✓ Active' : '○ Inactive'}
                                </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Form Title</label>
                                        <p className="text-lg font-semibold text-gray-900 mt-1">
                                            {activeGoogleForm.title || 'Untitled Form'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Description</label>
                                        <p className="text-gray-700 mt-1">
                                            {activeGoogleForm.description || 'No description provided'}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Created Date</label>
                                        <p className="text-gray-700 mt-1">
                                            {activeGoogleForm.createdAt 
                                                ? new Date(activeGoogleForm.createdAt).toLocaleDateString()
                                                : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Status</label>
                                        <div className="flex items-center mt-1">
                                            <div className={`w-2 h-2 rounded-full mr-2 ${
                                                activeGoogleForm.isActive ? 'bg-green-500' : 'bg-gray-400'
                                            }`}></div>
                                            <span className={`font-medium ${
                                                activeGoogleForm.isActive ? 'text-green-600' : 'text-gray-500'
                                            }`}>
                                                {activeGoogleForm.isActive ? 'Live in LMS' : 'Not displayed'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-green-200">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-gray-600">Status:</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={activeGoogleForm.isActive}
                                                onChange={handleToggleActive}
                                                className="sr-only peer"
                                                disabled={isTogglingForm}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 disabled:opacity-50"></div>
                                            <span className="ml-3 text-sm font-medium text-gray-700">
                                                {activeGoogleForm.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </label>
                                    </div>
                                </div>
                                {activeGoogleForm.url && (
                                    <a
                                        href={activeGoogleForm.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    >
                                        <FaExternalLinkAlt className="text-sm" />
                                        Open Google Form
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Google Form Manager Modal */}
            {showGoogleFormManager && (
                <GoogleFormManager onClose={handleGoogleFormManagerClose} />
            )}
        </div>
    );
};

export default AssessmentsData;
