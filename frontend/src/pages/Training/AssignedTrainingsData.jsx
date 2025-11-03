/**
 * Assigned Trainings Data Component
 * 
 * Displays assigned trainings with filtering and bulk delete functionality
 * Supports filtering by completion range, branch, and role
 * Includes keyboard shortcuts (Ctrl+A for select all) and confirmation modals
 * 
 * @returns {JSX.Element} - Assigned trainings data component
 */
import { Link } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo } from "react";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
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
    GET_ALL_TRAININGS: 'api/get/allusertraining',
    DELETE_TRAINING: (trainingId) => `api/user/delete/training/${trainingId}`,
};

/**
 * Route paths
 */
const ROUTE_PATHS = {
    ALL_TRAININGS: '/Alltraining',
    CREATE_TRAINING: '/createnewtraining',
    ASSIGN_TRAINING: (trainingId) => `/assigtraining/${trainingId}`,
    MANDATORY_TRAININGS: '/training',
};

/**
 * Filter range options
 */
const FILTER_RANGES = ['', '0-25', '26-51', '52-77', '78-100'];

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
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

/**
 * Assigned Trainings Data Component
 */
const AssignedTrainingsData = () => {
    const [isOpen, setIsOpen] = useState({ range: false, branch: false, role: false });
    const [isLoading, setIsLoading] = useState(false);
    const [trainings, setTrainings] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [filterRange, setFilterRange] = useState("");
    const [uniqueBranches, setUniqueBranches] = useState([]);
    const [uniqueItems, setUniqueItems] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState("");
    const [selectedItem, setSelectedItem] = useState("");
    const [selectedTrainings, setSelectedTrainings] = useState(new Set());
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    /**
     * Fetches assigned trainings data
     */
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_ENDPOINTS.GET_ALL_TRAININGS}`);
            
            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }

            const result = await response.json();
            const trainingsData = result.data || [];

            // Extract unique branches and items
            const branches = new Set();
            const items = new Set();
            trainingsData.forEach((training) => {
                if (Array.isArray(training.uniqueBranches)) {
                    training.uniqueBranches.forEach((branch) => branches.add(branch));
                }
                if (Array.isArray(training.uniqueItems)) {
                    training.uniqueItems.forEach((item) => items.add(item));
                }
            });

            setUniqueBranches([...branches]);
            setUniqueItems([...items]);
            setTrainings(trainingsData);
            setFilteredData(trainingsData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    /**
     * Applies filters to training data
     */
    const applyFilters = useCallback(() => {
        let filtered = [...trainings];

        // Filter by completion percentage range
        if (filterRange) {
            const rangeConfig = FILTER_RANGE_CONFIG[filterRange];
            if (rangeConfig) {
                filtered = filtered.filter(
                    (item) =>
                        item.averageCompletionPercentage >= rangeConfig.min &&
                        item.averageCompletionPercentage <= rangeConfig.max
                );
            }
        }

        // Filter by branch
        if (selectedBranch) {
            filtered = filtered.filter((item) =>
                item.uniqueBranches?.includes(selectedBranch)
            );
        }

        // Filter by role/item
        if (selectedItem) {
            filtered = filtered.filter((item) =>
                item.uniqueItems?.includes(selectedItem)
            );
        }

        setFilteredData(filtered);
    }, [trainings, filterRange, selectedBranch, selectedItem]);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    /**
     * Toggles dropdown visibility
     * 
     * @param {string} type - Dropdown type ('range', 'branch', or 'role')
     */
    const toggleDropdown = useCallback((type) => {
        setIsOpen((prev) => ({ ...prev, [type]: !prev[type] }));
    }, []);

    /**
     * Handles training selection
     * 
     * @param {string} trainingId - Training ID to toggle
     */
    const handleTrainingSelection = useCallback((trainingId) => {
        setSelectedTrainings((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(trainingId)) {
                newSet.delete(trainingId);
            } else {
                newSet.add(trainingId);
            }
            return newSet;
        });
    }, []);

    /**
     * Handles select all action
     */
    const handleSelectAll = useCallback(() => {
        if (selectedTrainings.size === filteredData.length) {
            setSelectedTrainings(new Set());
        } else {
            setSelectedTrainings(new Set(filteredData.map((item) => item.trainingId)));
        }
    }, [selectedTrainings.size, filteredData]);

    /**
     * Handles bulk delete of selected trainings
     */
    const handleBulkDelete = useCallback(async () => {
        if (selectedTrainings.size === 0) return;

        setIsDeleting(true);
        try {
            const deletePromises = Array.from(selectedTrainings).map((trainingId) =>
                fetch(`${API_CONFIG.baseUrl}${API_ENDPOINTS.DELETE_TRAINING(trainingId)}`, {
                    method: 'DELETE',
                    headers: buildAuthHeaders(),
                })
            );

            const results = await Promise.all(deletePromises);
            const failedDeletes = results.filter((result) => !result.ok);

            if (failedDeletes.length > 0) {
                alert(`Failed to delete ${failedDeletes.length} training(s). Please try again.`);
            } else {
                const deletedCount = selectedTrainings.size;
                setTrainings((prev) => prev.filter((item) => !selectedTrainings.has(item.trainingId)));
                setFilteredData((prev) => prev.filter((item) => !selectedTrainings.has(item.trainingId)));
                setSelectedTrainings(new Set());
                setShowDeleteConfirm(false);
                alert(`Successfully deleted ${deletedCount} training(s)`);
            }
        } catch (error) {
            console.error('Error deleting trainings:', error);
            alert('An error occurred while deleting trainings. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    }, [selectedTrainings]);

    /**
     * Handles delete all action
     */
    const handleDeleteAll = useCallback(() => {
        const deleteAllCheckbox = document.getElementById('deleteAllCheckbox');
        if (deleteAllCheckbox?.checked) {
            setSelectedTrainings(new Set(filteredData.map((item) => item.trainingId)));
            setShowDeleteConfirm(true);
        } else {
            alert('Please check the "Delete All Trainings" checkbox to confirm you want to delete all trainings.');
        }
    }, [filteredData]);

    /**
     * Keyboard shortcuts handler
     */
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ctrl+A for select all
            if (e.ctrlKey && e.key === 'a') {
                e.preventDefault();
                handleSelectAll();
            }
            // Escape to close delete confirmation
            if (e.key === 'Escape' && showDeleteConfirm) {
                setShowDeleteConfirm(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleSelectAll, showDeleteConfirm]);

    /**
     * Renders filter dropdown
     * 
     * @param {Object} props - Dropdown props
     * @param {string} props.type - Dropdown type
     * @param {string} props.label - Dropdown label
     * @param {Array} props.options - Options array
     * @param {string} props.selectedValue - Selected value
     * @param {Function} props.onChange - Change handler
     * @returns {JSX.Element} - Filter dropdown element
     */
    const FilterDropdown = ({ type, label, options, selectedValue, onChange }) => {
        const dropdownIsOpen = isOpen[type];

        return (
            <div className="relative text-left w-36">
                <button
                    type="button"
                    className="flex justify-between items-center w-full border-2 py-2 px-4 bg-white text-black rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                    onClick={() => toggleDropdown(type)}
                >
                    <h4>{selectedValue || label}</h4>
                    <CiFilter className="text-[#016E5B]" />
                </button>
                {dropdownIsOpen && (
                    <div className="absolute mt-2 w-full rounded-md shadow-lg bg-white z-10 border border-gray-200">
                        <div className="py-1">
                            <button
                                type="button"
                                onClick={() => onChange("")}
                                className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                            >
                                All
                            </button>
                            {options.map((option, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => onChange(option)}
                                    className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                                >
                                    {option || 'All'}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="mb-[70px] w-full h-full bg-white">
            <Header name="Assigned Training" />
            <SideNav />

            <div className="md:ml-[100px] mt-[100px]">
                {/* Header Section */}
                <div className="flex justify-end mr-20">
                    <Link to={ROUTE_PATHS.ALL_TRAININGS}>
                        <div className="flex w-56 mt-5 border-2 justify-center items-center py-2 ml-10 cursor-pointer hover:bg-gray-50 transition-colors">
                            <h4 className="text-black font-medium">Show All Training</h4>
                        </div>
                    </Link>
                </div>

                {/* Navigation Tabs */}
                <div className="flex text-black ml-10 gap-5 text-xl w-auto">
                    <Link to={ROUTE_PATHS.MANDATORY_TRAININGS}>
                        <h4 className="cursor-pointer hover:text-[#016E5B] transition-colors">
                            Mandatory Trainings
                        </h4>
                    </Link>
                    <h4 className="border-b-[3px] border-[#016E5B] text-[#016E5B]">
                        Assigned Trainings
                    </h4>
                </div>
                <hr className="mx-10 mt-[-1px] border-[#016E5B]" />

                {/* Action Bar */}
                <div className="flex mx-10 justify-between mt-10 gap-5">
                    <Link to={ROUTE_PATHS.CREATE_TRAINING}>
                        <div className="flex w-56 border-2 justify-evenly items-center py-2 ml-10 cursor-pointer hover:bg-gray-50 transition-colors">
                            <div className="text-[#016E5B]">
                                <FaPlus />
                            </div>
                            <h4 className="text-black font-medium">Create new Training</h4>
                        </div>
                    </Link>

                    {/* Filter Dropdowns */}
                    <div className="flex gap-2">
                        <FilterDropdown
                            type="range"
                            label="Range"
                            options={FILTER_RANGES}
                            selectedValue={filterRange ? `${filterRange}%` : ""}
                            onChange={(range) => {
                                setFilterRange(range);
                                toggleDropdown("range");
                            }}
                        />
                        <FilterDropdown
                            type="branch"
                            label="Branch"
                            options={uniqueBranches}
                            selectedValue={selectedBranch}
                            onChange={(branch) => {
                                setSelectedBranch(branch);
                                toggleDropdown("branch");
                            }}
                        />
                        <FilterDropdown
                            type="role"
                            label="Role"
                            options={uniqueItems}
                            selectedValue={selectedItem}
                            onChange={(item) => {
                                setSelectedItem(item);
                                toggleDropdown("role");
                            }}
                        />
                    </div>
                </div>

                {/* Bulk Actions Bar */}
                {filteredData.length > 0 && (
                    <div className="mt-6 ml-10 flex items-center gap-4 p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={selectedTrainings.size === filteredData.length && filteredData.length > 0}
                                onChange={handleSelectAll}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <span className="text-sm text-gray-700">
                                {selectedTrainings.size === 0
                                    ? "Select All (Ctrl+A)"
                                    : `${selectedTrainings.size} of ${filteredData.length} selected`
                                }
                            </span>
                        </div>

                        {selectedTrainings.size > 0 && (
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedTrainings(new Set())}
                                    className="px-3 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                                >
                                    Clear Selection
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    disabled={isDeleting}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <FaTrashAlt />
                                    Delete Selected ({selectedTrainings.size})
                                </button>
                            </div>
                        )}

                        {/* Delete All Trainings Option */}
                        <div className="ml-auto flex items-center gap-3 border-l border-gray-300 pl-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="deleteAllCheckbox"
                                    className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                                />
                                <label htmlFor="deleteAllCheckbox" className="text-sm text-gray-700 font-medium">
                                    Delete All Trainings
                                </label>
                            </div>
                            <button
                                type="button"
                                onClick={handleDeleteAll}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                            >
                                <FaTrashAlt />
                                Delete All
                            </button>
                        </div>
                    </div>
                )}

                {/* Training Cards Grid */}
                <div className="mt-10 ml-10 flex flex-wrap gap-3">
                    {isLoading ? (
                        <>
                            <Card />
                            <Card />
                            <Card />
                            <Card />
                        </>
                    ) : filteredData.length === 0 ? (
                        <div className="w-full text-center py-8 text-gray-500">
                            No assigned trainings found{filterRange || selectedBranch || selectedItem ? ' matching filters' : ''}.
                        </div>
                    ) : (
                        filteredData.map((training) => (
                            <div
                                key={training.trainingId}
                                className={`relative group ${
                                    selectedTrainings.has(training.trainingId)
                                        ? 'ring-2 ring-blue-500 ring-offset-2'
                                        : ''
                                }`}
                            >
                                {/* Selection Checkbox */}
                                <div className={`absolute top-2 left-2 z-10 transition-opacity ${
                                    selectedTrainings.has(training.trainingId)
                                        ? 'opacity-100'
                                        : 'opacity-0 group-hover:opacity-100'
                                }`}>
                                    <input
                                        type="checkbox"
                                        checked={selectedTrainings.has(training.trainingId)}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            handleTrainingSelection(training.trainingId);
                                        }}
                                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                                    />
                                </div>

                                {/* Training Card */}
                                <Link to={ROUTE_PATHS.ASSIGN_TRAINING(training.trainingId)}>
                                    <RoundProgressBar
                                        initialProgress={training.averageCompletionPercentage || 0}
                                        title={training.trainingName || 'Untitled Training'}
                                        Module={`No. of Modules : ${training.numberOfModules || 0}`}
                                        duration={`Total Users: ${training.totalUsers || 0} | Assigned: ${training.totalAssignedUsers || 0}`}
                                        complete={`Completion Rate : ${training.averageCompletionPercentage || 0}%`}
                                    />
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <FaTrashAlt className="text-red-600 text-xl" />
                            <h3 className="text-lg font-semibold text-gray-900">Confirm Bulk Delete</h3>
                        </div>

                        <p className="text-gray-700 mb-6">
                            Are you sure you want to delete <span className="font-semibold">{selectedTrainings.size}</span> training(s)?
                            This action cannot be undone and will also remove all associated training progress records.
                        </p>

                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleBulkDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <FaTrashAlt />
                                        Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignedTrainingsData;
