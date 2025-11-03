/**
 * Top Employee and Branch Component
 * 
 * Displays top or bottom performing employees and branches
 * Allows switching between employee and branch views
 * Sorts data by training progress and assessment scores
 * 
 * @returns {JSX.Element} - Component displaying top performers or loading state
 */
import { useState, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { BiSortAlt2 } from "react-icons/bi";
import { useGetBestThreeUsersQuery } from "../../features/dashboard/dashboardApi";

/**
 * View type constants
 */
const VIEW_TYPES = {
    EMPLOYEES: 'employees',
    BRANCHES: 'branches',
};

/**
 * Data type constants
 */
const DATA_TYPES = {
    TOP: 'top',
    LAST: 'last',
};

/**
 * User role constants
 */
const USER_ROLES = {
    STORE_ADMIN: 'store_admin',
};

/**
 * Ranking colors
 */
const RANKING_COLORS = {
    FIRST: 'bg-green-400',
    SECOND: 'bg-yellow-400',
    THIRD: 'bg-red-400',
};

/**
 * Sorts users by training progress (primary) and assessment progress (secondary)
 * 
 * @param {Array} users - Array of user objects
 * @returns {Array} - Sorted array of users
 */
const sortUsersByProgress = (users) => {
    return [...users].sort((a, b) => {
        // Primary sort by training progress
        if (b.trainingProgress !== a.trainingProgress) {
            return b.trainingProgress - a.trainingProgress;
        }
        // Secondary sort by assessment progress
        return b.assessmentProgress - a.assessmentProgress;
    });
};

/**
 * Formats percentage value
 * 
 * @param {number} value - Percentage value
 * @returns {number} - Rounded percentage
 */
const formatPercentage = (value) => {
    return Math.round(value || 0);
};

/**
 * Gets ranking color class based on index
 * 
 * @param {number} index - Zero-based index (0, 1, 2)
 * @returns {string} - CSS class name
 */
const getRankingColor = (index) => {
    const rank = index + 1;
    if (rank === 1) return RANKING_COLORS.FIRST;
    if (rank === 2) return RANKING_COLORS.SECOND;
    return RANKING_COLORS.THIRD;
};

/**
 * Top Employee and Branch Component
 */
const TopEmployeeAndBranch = () => {
    const [view, setView] = useState(VIEW_TYPES.EMPLOYEES);
    const [dataType, setDataType] = useState(DATA_TYPES.TOP);
    const user = useSelector((state) => state.auth.user);

    // Fetch data using RTK Query
    const { data: responseData, isLoading } = useGetBestThreeUsersQuery();
    const allData = responseData?.data || {};

    /**
     * Handles toggling between 'top' and 'last' data
     * 
     * @param {string} type - Data type ('top' or 'last')
     */
    const handleDataTypeToggle = useCallback((type) => {
        setDataType(type);
    }, []);

    /**
     * Handles toggling between 'employees' and 'branches' view
     * 
     * @param {string} type - View type ('employees' or 'branches')
     */
    const handleViewToggle = useCallback((type) => {
        setView(type);
    }, []);

    /**
     * Toggles data type between top and last
     */
    const toggleDataType = useCallback(() => {
        setDataType((prev) => prev === DATA_TYPES.TOP ? DATA_TYPES.LAST : DATA_TYPES.TOP);
    }, []);

    /**
     * Renders employee list
     */
    const renderEmployees = useMemo(() => {
        const users = dataType === DATA_TYPES.TOP ? allData.topUsers : allData.lastUsers;

        if (!users || users.length === 0) {
            return <p className="text-gray-500">No data available</p>;
        }

        const sortedUsers = sortUsersByProgress(users);

        return sortedUsers.map((userItem, index) => (
            <div
                key={`employee-${index}`}
                className="flex items-center bg-gray-100 p-2 rounded-md"
            >
                <div
                    className={`flex items-center justify-center w-12 h-12 ${getRankingColor(index)} text-white font-bold text-lg rounded-full`}
                >
                    {index + 1}
                </div>
                <div className="ml-4 flex-1">
                    <p className="font-medium">{userItem.username}</p>
                    <p className="text-gray-500 text-sm">{userItem.branch}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-green-600">
                        {formatPercentage(userItem.trainingProgress)}%{' '}
                        <span className="text-gray-500">Training Completed</span>
                    </p>
                    <p className="font-bold text-green-600">
                        {formatPercentage(userItem.assessmentProgress)}%{' '}
                        <span className="text-gray-500">Assessment Score</span>
                    </p>
                </div>
            </div>
        ));
    }, [allData, dataType]);

    /**
     * Renders branch list
     */
    const renderBranches = useMemo(() => {
        const branches = dataType === DATA_TYPES.TOP ? allData.topBranches : allData.lastBranches;

        if (!branches || branches.length === 0) {
            return <p className="text-gray-500">No data available</p>;
        }

        return branches.map((branch, index) => (
            <div
                key={`branch-${index}`}
                className="flex items-center bg-gray-100 p-2 rounded-md"
            >
                <div
                    className={`flex items-center justify-center w-12 h-12 ${getRankingColor(index)} text-white font-bold text-lg rounded-full`}
                >
                    {index + 1}
                </div>
                <div className="ml-4 flex-1">
                    <p className="font-medium">{branch.branch || branch}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-green-600">
                        {formatPercentage(branch?.averageTrainingProgress)}%{' '}
                        <span className="text-gray-500">Completed Training</span>
                    </p>
                    <p className="font-bold text-green-600">
                        {formatPercentage(branch.averageAssessmentProgress)}%{' '}
                        <span className="text-gray-500">Completed Assessment</span>
                    </p>
                </div>
            </div>
        ));
    }, [allData, dataType]);

    // Loading state
    if (isLoading) {
        return (
            <div
                role="status"
                className="flex items-center justify-center w-[600px] h-[400px] shadow-xl bg-slate-100 rounded-lg animate-pulse"
                aria-label="Loading performance data"
            >
                <span className="sr-only">Loading...</span>
            </div>
        );
    }

    const displayTitle = dataType === DATA_TYPES.LAST ? 'Low' : 'Top';
    const showViewToggle = user?.role !== USER_ROLES.STORE_ADMIN;

    return (
        <div className="p-2 bg-white w-full h-[400px] border border-gray-300 rounded-xl shadow-lg mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold flex items-center text-black">
                    <BiSortAlt2
                        onClick={toggleDataType}
                        className="text-2xl text-green-500 cursor-pointer mr-2"
                        aria-label={`Switch to ${dataType === DATA_TYPES.TOP ? 'low' : 'top'} performance`}
                    />
                    {displayTitle} Performance
                </h2>
            </div>

            {/* View Toggle - Hidden for store_admin */}
            {showViewToggle && (
                <div className="mb-4">
                    <button
                        className="bg-green-300 relative text-white flex gap-0 rounded-md text-sm transition-all duration-300"
                        onClick={() => handleViewToggle(
                            view === VIEW_TYPES.EMPLOYEES ? VIEW_TYPES.BRANCHES : VIEW_TYPES.EMPLOYEES
                        )}
                        aria-label="Toggle between employees and branches view"
                    >
                        <span
                            className={`flex-1 px-4 py-2 text-center rounded-l-md transition-colors duration-300 ${
                                view === VIEW_TYPES.EMPLOYEES
                                    ? 'bg-green-700 text-white rounded-lg'
                                    : 'bg-gray-200 text-black'
                            }`}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleViewToggle(VIEW_TYPES.EMPLOYEES);
                            }}
                        >
                            Employees
                        </span>
                        <span
                            className={`flex-1 px-4 py-2 text-center rounded-r-md transition-colors duration-300 ${
                                view === VIEW_TYPES.BRANCHES
                                    ? 'bg-green-700 text-white rounded-lg'
                                    : 'bg-gray-200 text-black'
                            }`}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleViewToggle(VIEW_TYPES.BRANCHES);
                            }}
                        >
                            Branches
                        </span>
                    </button>
                </div>
            )}

            {/* Content */}
            <div className="space-y-4">
                {view === VIEW_TYPES.EMPLOYEES ? renderEmployees : renderBranches}
            </div>
        </div>
    );
};

export default TopEmployeeAndBranch;
