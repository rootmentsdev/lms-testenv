/**
 * Training Data Component
 * 
 * Displays all training programs with filtering by completion percentage range
 * Supports creating new trainings and deleting all trainings (with confirmation)
 * 
 * @returns {JSX.Element} - Training data component
 */
import { Link } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { FaPlus } from "react-icons/fa";
import { CiFilter } from "react-icons/ci";

import Header from "../../components/Header/Header";
import SideNav from "../../components/SideNav/SideNav";
import Card from "../../components/Skeleton/Card";
import RoundProgressBar from "../../components/RoundBar/RoundBar";
import API_CONFIG from "../../api/api";

/**
 * API endpoints
 */
const API_ENDPOINTS = {
    GET_ALL_TRAININGS: 'api/get/Full/allusertraining',
    DELETE_TRAINING: (trainingId) => `api/user/delete/training/${trainingId}`,
};

/**
 * Route paths
 */
const ROUTE_PATHS = {
    CREATE_NEW_TRAINING: '/createnewtraining',
    CREATE_MANDATORY_TRAINING: '/create/Mandatorytraining',
    ASSIGN_TRAINING: (trainingId) => `/AssigTraining/${trainingId}`,
};

/**
 * Filter range options
 */
const FILTER_RANGES = [
    { label: 'ALL', value: '' },
    { label: '0-25%', value: '0-25' },
    { label: '26-51%', value: '26-51' },
    { label: '52-77%', value: '52-77' },
    { label: '78-100%', value: '78-100' },
];

/**
 * Filter range configurations
 */
const FILTER_RANGE_CONFIG = {
    '0-25': { min: 0, max: 25 },
    '26-51': { min: 26, max: 51 },
    '52-77': { min: 52, max: 77 },
    '78-100': { min: 78, max: 100 },
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
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

/**
 * Training Data Component
 */
const TrainingData = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [trainings, setTrainings] = useState([]);
    const [filter, setFilter] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const user = useSelector((state) => state.auth.user);

    /**
     * Fetches all training data
     */
    const fetchTrainings = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_ENDPOINTS.GET_ALL_TRAININGS}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setTrainings(result.data || []);
        } catch (error) {
            console.error('Error fetching trainings:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTrainings();
    }, [fetchTrainings]);

    /**
     * Filters trainings based on completion percentage range
     */
    const filteredTrainings = useMemo(() => {
        if (!filter) return trainings;

        const rangeConfig = FILTER_RANGE_CONFIG[filter];
        if (!rangeConfig) return trainings;

        return trainings.filter((item) => {
            const percentage = item?.averageCompletionPercentage || 0;
            return percentage >= rangeConfig.min && percentage <= rangeConfig.max;
        });
    }, [trainings, filter]);

    /**
     * Handles filter change
     * 
     * @param {string} range - Filter range value
     */
    const handleFilterChange = useCallback((range) => {
        setFilter(range);
        setIsDropdownOpen(false);
    }, []);

    /**
     * Clears filter
     */
    const handleClearFilter = useCallback(() => {
        setFilter("");
        setIsDropdownOpen(false);
    }, []);

    /**
     * Toggles dropdown visibility
     */
    const toggleDropdown = useCallback(() => {
        setIsDropdownOpen((prev) => !prev);
    }, []);

    /**
     * Deletes all filtered trainings with confirmation
     */
    const handleDeleteAllTrainings = useCallback(async () => {
        const deleteCheckbox = document.getElementById('deleteAllCheckbox');
        
        if (!deleteCheckbox?.checked) {
            alert('Please check the confirmation checkbox to delete all trainings.');
            return;
        }

        if (!confirm('Are you absolutely sure you want to delete ALL trainings? This action cannot be undone!')) {
            return;
        }

        if (filteredTrainings.length === 0) {
            alert('No trainings found to delete.');
            return;
        }

        setIsDeleting(true);
        try {
            const deletePromises = filteredTrainings.map((training) =>
                fetch(`${API_CONFIG.baseUrl}${API_ENDPOINTS.DELETE_TRAINING(training._id)}`, {
                    method: 'DELETE',
                    headers: buildAuthHeaders(),
                })
            );

            const results = await Promise.all(deletePromises);
            const failedDeletes = results.filter((result) => !result.ok);

            if (failedDeletes.length > 0) {
                alert(`Failed to delete ${failedDeletes.length} training(s). Please try again.`);
            } else {
                alert(`Successfully deleted ${filteredTrainings.length} training(s)`);
                deleteCheckbox.checked = false;
                await fetchTrainings();
            }
        } catch (error) {
            console.error('Error deleting all trainings:', error);
            alert('An error occurred while deleting all trainings. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    }, [filteredTrainings, fetchTrainings]);

    return (
        <div className="w-full h-full bg-white mb-[70px]">
            <Header name="All Training" />
            <SideNav />

            <div className="md:ml-[100px] mt-[150px]">
                {/* Header Actions */}
                <div className="flex mx-10 justify-between mt-10">
                    <div className="md:flex hidden gap-4">
                        <Link to={ROUTE_PATHS.CREATE_NEW_TRAINING}>
                            <div className="flex w-56 border-2 justify-evenly items-center py-2 ml-10 cursor-pointer hover:bg-gray-50 transition-colors">
                                <div className="text-green-500">
                                    <FaPlus />
                                </div>
                                <h4 className="text-black font-medium">Create new Training</h4>
                            </div>
                        </Link>
                        {user?.role === 'super_admin' && (
                            <Link to={ROUTE_PATHS.CREATE_MANDATORY_TRAINING}>
                                <div className="flex w-56 border-2 justify-evenly items-center py-2 ml-10 cursor-pointer hover:bg-gray-50 transition-colors">
                                    <div className="text-green-500">
                                        <FaPlus />
                                    </div>
                                    <h4 className="text-black font-medium">Create Mandatory Training</h4>
                                </div>
                            </Link>
                        )}
                    </div>

                    {/* Filter Dropdown */}
                    <div className="relative hidden md:inline-block text-left w-36 mr-10">
                        <button
                            type="button"
                            className="flex justify-between items-center w-full border-2 py-2 px-4 bg-white text-black rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            onClick={toggleDropdown}
                            aria-label="Filter by completion range"
                        >
                            <h4>{filter ? `${filter}%` : "Range"}</h4>
                            <CiFilter className="text-[#016E5B]" />
                        </button>

                        {isDropdownOpen && (
                            <div
                                className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                                role="menu"
                                aria-orientation="vertical"
                            >
                                <div className="py-1">
                                    {FILTER_RANGES.map((range) => (
                                        <button
                                            key={range.value}
                                            type="button"
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => 
                                                range.value ? handleFilterChange(range.value) : handleClearFilter()
                                            }
                                            role="menuitem"
                                        >
                                            {range.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Danger Zone - Delete All Trainings */}
                <div className="mt-6 ml-10 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-red-800 mb-3">⚠️ Danger Zone</h3>
                    <p className="text-sm text-red-700 mb-4">
                        This action will permanently delete ALL trainings and cannot be undone.
                    </p>
                    <div className="flex items-center gap-3 mb-3">
                        <input
                            type="checkbox"
                            id="deleteAllCheckbox"
                            className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                            disabled={isDeleting}
                        />
                        <label htmlFor="deleteAllCheckbox" className="text-sm text-red-700 font-medium">
                            I understand this will delete ALL trainings
                        </label>
                    </div>
                    <button
                        type="button"
                        onClick={handleDeleteAllTrainings}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                        disabled={isDeleting}
                    >
                        🗑️ Delete All Trainings
                    </button>
                </div>

                {/* Training Cards Grid */}
                <div className="mt-10 ml-10 flex flex-wrap gap-3">
                    {isLoading && (
                        <>
                            <Card />
                            <Card />
                            <Card />
                            <Card />
                        </>
                    )}
                    {!isLoading && filteredTrainings.length === 0 && (
                        <div className="w-full text-center py-8 text-gray-500">
                            No trainings found{filter ? ` matching filter "${filter}%"` : ''}.
                        </div>
                    )}
                    {!isLoading && filteredTrainings.map((training) => (
                        <Link 
                            key={training._id} 
                            to={ROUTE_PATHS.ASSIGN_TRAINING(training?.trainingId)}
                        >
                            <RoundProgressBar
                                initialProgress={training?.averageCompletionPercentage || 0}
                                title={training?.trainingName}
                                Module={`No. of Modules : ${training?.numberOfModules || 0}`}
                                duration={`No. of users: ${training?.totalUsers || 0}`}
                                complete={`Completion Rate : ${training?.averageCompletionPercentage || 0}%`}
                            />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrainingData;
