/**
 * Assign Assessment Data Component
 * 
 * Allows assigning assessments to users, branches, or designations
 * Supports filtering by assignment type and creating new assessment assignments
 * 
 * @returns {JSX.Element} - Assign assessment data component
 */
import { useEffect, useState, useCallback } from "react";
import Select from "react-select";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";

import Header from "../../../components/Header/Header";
import SideNav from "../../../components/SideNav/SideNav";
import API_CONFIG from "../../../api/api";

/**
 * API endpoints
 */
const API_ENDPOINTS = {
    GET_ALL_ASSESSMENTS: 'api/user/get/AllAssessment',
    GET_ALL_USERS: 'api/usercreate/getAllUser',
    GET_BRANCHES: 'api/usercreate/getBranch',
    GET_EMPLOYEES: 'api/employee_range',
    CREATE_ASSESSMENT_ASSIGNMENT: 'api/user/post/createAssessment',
};

/**
 * Assignment type options
 */
const ASSIGNMENT_TYPES = [
    { value: 'user', label: 'Individual Users' },
    { value: 'branch', label: 'Branches' },
    { value: 'designation', label: 'Designations' },
];

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
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

/**
 * Assign Assessment Data Component
 */
const AssignAssessmentData = () => {
    const [assessments, setAssessments] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedAssessments, setSelectedAssessments] = useState([]);
    const [assignedTo, setAssignedTo] = useState([]);
    const [days, setDays] = useState("");
    const [selectedOption, setSelectedOption] = useState("user");
    const [shouldReassign, setShouldReassign] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const token = getAuthToken();

    /**
     * Fetches assessments from API
     */
    const fetchAssessments = useCallback(async () => {
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_ENDPOINTS.GET_ALL_ASSESSMENTS}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const assessmentOptions = (data?.data || []).map((assessment) => ({
                value: assessment.assessmentId,
                label: assessment.assessmentName,
            }));

            setAssessments(assessmentOptions);
        } catch (error) {
            console.error("Failed to fetch assessments:", error.message);
            setError('Failed to load assessments');
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Fetches users based on selected assignment type
     */
    const fetchUsers = useCallback(async () => {
        if (!token) return;

        try {
            let options = [];

            if (selectedOption === "user") {
                const response = await fetch(`${API_CONFIG.baseUrl}${API_ENDPOINTS.GET_ALL_USERS}`, {
                    method: "GET",
                    headers: buildAuthHeaders(),
                    credentials: "include",
                });

                if (response.ok) {
                    const data = await response.json();
                    options = (data.data || []).map((item) => ({
                        value: item._id,
                        label: item.username || 'Unknown User',
                    }));
                }
            } else if (selectedOption === "branch") {
                const response = await fetch(`${API_CONFIG.baseUrl}${API_ENDPOINTS.GET_BRANCHES}`, {
                    method: "GET",
                    headers: buildAuthHeaders(),
                    credentials: "include",
                });

                if (response.ok) {
                    const data = await response.json();
                    options = (data.data || []).map((item) => ({
                        value: item.locCode,
                        label: item.workingBranch || 'Unknown Branch',
                    }));
                }
            } else if (selectedOption === "designation") {
                const response = await fetch(`${API_CONFIG.baseUrl}${API_ENDPOINTS.GET_EMPLOYEES}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ startEmpId: "EMP1", endEmpId: "EMP9999" }),
                });

                if (response.ok) {
                    const data = await response.json();
                    const uniqueDesignations = [...new Set(
                        (data?.data || [])
                            .map(emp => emp.role_name)
                            .filter(Boolean)
                    )].sort();

                    options = uniqueDesignations.map((designation) => ({
                        value: designation,
                        label: designation,
                    }));
                }
            }

            setUsers(options);
        } catch (error) {
            console.error("Failed to fetch users:", error.message);
            setError('Failed to load users');
        }
    }, [selectedOption, token]);

    useEffect(() => {
        fetchAssessments();
    }, [fetchAssessments]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    /**
     * Handles form submission
     * 
     * @param {React.FormEvent} e - Form submit event
     */
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (selectedAssessments.length === 0) {
            toast.warning('Please select at least one assessment');
            return;
        }

        if (assignedTo.length === 0) {
            toast.warning('Please select at least one user, branch, or designation');
            return;
        }

        if (!days || parseInt(days) <= 0) {
            toast.warning('Please enter a valid number of days');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const payload = {
                assignedTo: assignedTo.map((item) => item.value),
                assessmentId: selectedAssessments.map((item) => item.value),
                selectedOption,
                days: parseInt(days),
                Reassign: shouldReassign,
            };

            const response = await fetch(
                `${API_CONFIG.baseUrl}${API_ENDPOINTS.CREATE_ASSESSMENT_ASSIGNMENT}`,
                {
                    method: "POST",
                    headers: buildAuthHeaders(),
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.message === 'already Assigned') {
                toast.error(result.message);
            } else {
                toast.success(result.message || 'Assessment assigned successfully');
                // Reset form
                setSelectedAssessments([]);
                setAssignedTo([]);
                setDays("");
            }
        } catch (error) {
            console.error("Error assigning assessment:", error);
            toast.error(error.message || 'Failed to assign assessment');
            setError(error.message || 'Failed to assign assessment');
        } finally {
            setIsSubmitting(false);
        }
    }, [selectedAssessments, assignedTo, days, selectedOption, shouldReassign]);

    return (
        <div className="w-full mb-[70px] h-full bg-white text-black">
            <Header name="Assign Assessment" />
            <SideNav />

            <div className="md:ml-[100px] mt-[150px]">
                <div className="mx-10">
                    <h1 className="text-2xl font-semibold mb-6">Assign Assessment</h1>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        {/* Assessment Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Assessment(s):
                            </label>
                            <Select
                                placeholder="Select assessments"
                                options={assessments}
                                isMulti
                                value={selectedAssessments}
                                onChange={setSelectedAssessments}
                                isSearchable={true}
                                isDisabled={isLoading || isSubmitting}
                            />
                        </div>

                        {/* Assignment Type Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Assign To:
                            </label>
                            <div className="flex gap-4">
                                {ASSIGNMENT_TYPES.map((type) => (
                                    <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            value={type.value}
                                            checked={selectedOption === type.value}
                                            onChange={(e) => {
                                                setSelectedOption(e.target.value);
                                                setAssignedTo([]); // Clear selection when type changes
                                            }}
                                            disabled={isSubmitting}
                                            className="text-[#016E5B]"
                                        />
                                        <span>{type.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* User/Branch/Designation Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select {selectedOption === 'user' ? 'Users' : selectedOption === 'branch' ? 'Branches' : 'Designations'}:
                            </label>
                            <Select
                                placeholder={`Select ${selectedOption === 'user' ? 'users' : selectedOption === 'branch' ? 'branches' : 'designations'}`}
                                options={users}
                                isMulti
                                value={assignedTo}
                                onChange={setAssignedTo}
                                isSearchable={true}
                                isDisabled={isSubmitting || users.length === 0}
                            />
                            {users.length === 0 && (
                                <p className="text-sm text-gray-500 mt-1">No {selectedOption} options available</p>
                            )}
                        </div>

                        {/* Days Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Days to Complete:
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={days}
                                onChange={(e) => setDays(e.target.value)}
                                placeholder="Enter number of days"
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#016E5B]"
                                disabled={isSubmitting}
                                required
                            />
                        </div>

                        {/* Reassign Toggle */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="reassign"
                                checked={shouldReassign}
                                onChange={(e) => setShouldReassign(e.target.checked)}
                                disabled={isSubmitting}
                                className="w-4 h-4 text-[#016E5B] border-gray-300 rounded focus:ring-[#016E5B]"
                            />
                            <label htmlFor="reassign" className="text-sm text-gray-700 cursor-pointer">
                                Reassign if already assigned
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="px-6 py-3 bg-[#016E5B] text-white rounded-md hover:bg-[#014C3F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                            disabled={isSubmitting || selectedAssessments.length === 0 || assignedTo.length === 0 || !days}
                        >
                            <FaPlus />
                            {isSubmitting ? 'Assigning...' : 'Assign Assessment'}
                        </button>

                        {error && (
                            <div className="text-red-500 text-sm">{error}</div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AssignAssessmentData;
