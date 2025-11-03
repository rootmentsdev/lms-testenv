/**
 * User Training Progress Data Component
 * 
 * Displays detailed training progress for a specific training
 * Shows training information, assigned employees, progress, and assessment status
 * 
 * @returns {JSX.Element} - User training progress data component
 */
import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo } from "react";

import Header from "../../../components/Header/Header";
import SideNav from "../../../components/SideNav/SideNav";
import API_CONFIG from "../../../api/api";

/**
 * API endpoints
 */
const API_ENDPOINTS = {
    GET_TRAINING_DETAILS: (trainingId) => `api/user/get/Training/details/${trainingId}`,
};

/**
 * Table column headers
 */
const TABLE_HEADERS = [
    'Emp Id',
    'Name',
    'Role',
    'Branch',
    'Days Left',
    'Assessment',
    'Training Status',
];

/**
 * Milliseconds per day constant
 */
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Formats date to localized string
 * 
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} - Formatted date string
 */
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
        return new Date(dateString).toLocaleString();
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
    }
};

/**
 * Calculates days remaining until deadline
 * 
 * @param {string|Date} deadline - Deadline date
 * @returns {number|string} - Days remaining or 'N/A'
 */
const calculateDaysLeft = (deadline) => {
    if (!deadline) return 'N/A';
    
    try {
        const deadlineDate = new Date(deadline);
        const today = new Date();
        
        if (isNaN(deadlineDate.getTime())) {
            return 'N/A';
        }
        
        const timeDiff = deadlineDate - today;
        return Math.ceil(timeDiff / MS_PER_DAY);
    } catch (error) {
        console.error('Error calculating days left:', error);
        return 'N/A';
    }
};

/**
 * Calculates due date from created date and deadline days
 * 
 * @param {string|Date} createdDate - Training created date
 * @param {number} deadlineDays - Number of days until deadline
 * @returns {string} - Formatted due date
 */
const calculateDueDate = (createdDate, deadlineDays) => {
    if (!createdDate || !deadlineDays) return 'N/A';
    
    try {
        const created = new Date(createdDate);
        if (isNaN(created.getTime())) return 'N/A';
        
        const dueDate = new Date(created.getTime() + deadlineDays * MS_PER_DAY);
        return formatDate(dueDate);
    } catch (error) {
        console.error('Error calculating due date:', error);
        return 'N/A';
    }
};

/**
 * Gets status styling class based on progress and days left
 * 
 * @param {number|string} progress - Progress percentage or status
 * @param {number|string} daysLeft - Days remaining
 * @returns {string} - CSS class names
 */
const getStatusClassName = (progress, daysLeft) => {
    if (progress === 'Completed' || progress === 100) {
        return 'bg-green-100 text-green-800';
    }
    
    if (typeof daysLeft === 'number' && daysLeft < 0) {
        return 'bg-red-100 text-red-800';
    }
    
    if (typeof daysLeft === 'number' && daysLeft <= 3) {
        return 'bg-yellow-100 text-yellow-800';
    }
    
    return '';
};

/**
 * Gets display text for days left
 * 
 * @param {number|string} progress - Progress percentage or status
 * @param {number|string} daysLeft - Days remaining
 * @returns {string} - Display text
 */
const getDaysLeftText = (progress, daysLeft) => {
    if (progress === 'Completed' || progress === 100) {
        return 'Completed';
    }
    
    if (typeof daysLeft === 'number' && daysLeft < 0) {
        return `Overdue (${Math.abs(daysLeft)} days)`;
    }
    
    if (typeof daysLeft === 'number' && daysLeft <= 3) {
        return `${daysLeft} days (Due Soon)`;
    }
    
    return daysLeft;
};

/**
 * User Training Progress Data Component
 */
const UserTrainingProgressData = () => {
    const { id } = useParams();
    const [trainingData, setTrainingData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Fetches training details from API
     */
    const fetchTrainingDetails = useCallback(async () => {
        if (!id) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${API_CONFIG.baseUrl}${API_ENDPOINTS.GET_TRAINING_DETAILS(id)}`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setTrainingData(data);
        } catch (error) {
            console.error("Failed to fetch training details:", error.message);
            setError("Failed to load training details. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchTrainingDetails();
    }, [fetchTrainingDetails]);

    /**
     * Training information
     */
    const training = trainingData?.training || {};
    const progressDetails = trainingData?.progressDetails || [];
    const uniqueBranches = trainingData?.uniqueBranches || [];
    const uniqueDesignations = trainingData?.uniquedesignation || [];

    /**
     * Due date calculation
     */
    const dueDate = useMemo(() => {
        return calculateDueDate(training.createdDate, training.deadline);
    }, [training.createdDate, training.deadline]);

    if (isLoading) {
        return (
            <div className="w-full mb-[70px] h-full bg-white">
                <Header name="Training Details" />
                <SideNav />
                <div className="md:ml-[100px] mt-[150px]">
                    <div className="text-center py-8 text-gray-500">Loading training details...</div>
                </div>
            </div>
        );
    }

    if (error || !trainingData) {
        return (
            <div className="w-full mb-[70px] h-full bg-white">
                <Header name="Training Details" />
                <SideNav />
                <div className="md:ml-[100px] mt-[150px]">
                    <div className="text-center py-8 text-red-500">{error || 'Training not found'}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full mb-[70px] h-full bg-white">
            <Header name="Training Details" />
            <SideNav />

            <div className="md:ml-[100px] mt-[150px]">
                {/* Header Section */}
                <div className="px-4 md:px-10 mt-10 text-2xl text-black">
                    <div className="text-2xl text-black flex gap-2 flex-col">
                        <h3>Training Details</h3>
                        <hr className="border-b-0 border-black" />
                    </div>

                    {/* Training Information */}
                    <div className="flex flex-col md:flex-row md:mx-20 text-xl text-black justify-between gap-6 md:gap-8 mt-6">
                        <div className="flex flex-col gap-6 md:flex-row md:gap-8">
                            <div className="flex flex-col gap-6">
                                <h4>
                                    {training.Trainingtype || 'N/A'}: {training.trainingName || 'Untitled Training'}
                                </h4>
                                <h4>Assigned: {formatDate(training.createdDate)}</h4>
                                <h4>Due Date: {dueDate}</h4>
                            </div>
                        </div>

                        {/* Assignment Details */}
                        <div className="flex flex-col gap-6 md:gap-8">
                            <div className="flex flex-col gap-6">
                                <h1 className="font-bold">Assigned for</h1>
                                <div className="flex flex-col gap-4">
                                    <div className="flex gap-4">
                                        <h4>No. of employees:</h4>
                                        <h4>{progressDetails.length}</h4>
                                    </div>
                                    <div className="flex gap-4">
                                        <h4>Branch:</h4>
                                        <h4>
                                            {uniqueBranches.length > 0 ? (
                                                uniqueBranches.map((item, index) => (
                                                    <span key={index}>
                                                        {item}
                                                        {index < uniqueBranches.length - 1 ? ', ' : ''}
                                                    </span>
                                                ))
                                            ) : (
                                                'N/A'
                                            )}
                                        </h4>
                                    </div>
                                    <div className="flex gap-4">
                                        <h4>Role:</h4>
                                        <h4>
                                            {uniqueDesignations.length > 0 ? (
                                                uniqueDesignations.map((item, index) => (
                                                    <span key={index}>
                                                        {item}
                                                        {index < uniqueDesignations.length - 1 ? ', ' : ''}
                                                    </span>
                                                ))
                                            ) : (
                                                'N/A'
                                            )}
                                        </h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Table */}
                <div className="mb-10">
                    <div className="overflow-x-auto mx-4 mt-5 text-black">
                        <table className="min-w-full border-2 border-gray-300">
                            <thead>
                                <tr className="bg-[#016E5B] text-white">
                                    {TABLE_HEADERS.map((header) => (
                                        <th key={header} className="px-3 py-2 border-2 border-gray-300 text-left">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {progressDetails.length > 0 ? (
                                    progressDetails.map((employee, index) => {
                                        const training = employee.user?.training?.[0];
                                        const assessment = employee.user?.assignedAssessments?.[0];
                                        const daysLeft = calculateDaysLeft(training?.deadline);
                                        const assessmentStatus = assessment?.status || 'Pending';

                                        return (
                                            <tr key={employee.user?.empID || index} className="border-b hover:bg-gray-100 transition-colors">
                                                <td className="px-3 py-2 border-2 border-gray-300">
                                                    {employee.user?.empID || 'N/A'}
                                                </td>
                                                <td className="px-3 py-2 border-2 border-gray-300">
                                                    {employee.user?.username || 'N/A'}
                                                </td>
                                                <td className="px-3 py-2 border-2 border-gray-300">
                                                    {employee.user?.designation?.toUpperCase() || 'N/A'}
                                                </td>
                                                <td className="px-3 py-2 border-2 border-gray-300">
                                                    {employee.user?.workingBranch || 'N/A'}
                                                </td>
                                                <td className={`px-3 py-2 border-2 border-gray-300 ${getStatusClassName(employee.progress, daysLeft)}`}>
                                                    {getDaysLeftText(employee.progress, daysLeft)}
                                                </td>
                                                <td className="px-3 py-2 border-2 border-gray-300">
                                                    {assessmentStatus}
                                                </td>
                                                <td className="px-3 py-2 border-2 border-gray-300">
                                                    {employee.progress || 0}%
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={TABLE_HEADERS.length} className="text-center py-3">
                                            No data available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserTrainingProgressData;
