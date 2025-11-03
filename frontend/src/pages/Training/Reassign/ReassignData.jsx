/**
 * Reassign Training Data Component
 * 
 * Allows reassigning training to different users
 * Supports filtering users by role and bulk selection
 * 
 * @returns {JSX.Element} - Reassign training data component
 */
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";

import Header from "../../../components/Header/Header";
import SideNav from '../../../components/SideNav/SideNav';
import API_CONFIG from "../../../api/api";

/**
 * API endpoints
 */
const API_ENDPOINTS = {
    GET_TRAINING_DETAILS: (trainingId) => `api/trainings/${trainingId}`,
    GET_EMPLOYEES: 'api/employee_range',
    REASSIGN_TRAINING: 'api/user/reassign/training',
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
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

/**
 * Reassign Training Data Component
 */
const ReassignData = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [training, setTraining] = useState(null);
    const [assignedTo, setAssignedTo] = useState([]);
    const [users, setUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedRole, setSelectedRole] = useState("");
    const [availableRoles, setAvailableRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Fetches training details from API
     */
    const fetchTrainingDetails = useCallback(async () => {
        if (!id) return;

        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_ENDPOINTS.GET_TRAINING_DETAILS(id)}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch training details');
            }

            const result = await response.json();
            setTraining(result);
        } catch (err) {
            console.error('Error fetching training details:', err);
            setError('Failed to load training details');
        }
    }, [id]);

    /**
     * Fetches employees from API
     */
    const fetchUsers = useCallback(async () => {
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_ENDPOINTS.GET_EMPLOYEES}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ startEmpId: "EMP1", endEmpId: "EMP9999" }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const employeeData = data?.data || [];

            // Map employees to react-select options
            const options = employeeData.map((employee) => ({
                value: employee.emp_code,
                label: `EmpId: ${employee.emp_code || 'N/A'} | Name: ${employee.name || 'N/A'} | Role: ${employee.role_name || 'N/A'}`,
                role: employee.role_name,
                empID: employee.emp_code,
                username: employee.name,
                branch: employee.store_name,
                email: employee.email,
            }));

            setAllUsers(options);
            setUsers(options);

            // Extract unique roles
            const roles = [...new Set(employeeData.map(emp => emp.role_name).filter(Boolean))];
            setAvailableRoles(roles);
        } catch (error) {
            console.error("Failed to fetch users:", error.message);
            setError('Failed to load employees');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTrainingDetails();
        fetchUsers();
    }, [fetchTrainingDetails, fetchUsers]);

    /**
     * Handles role filter change
     * 
     * @param {string} role - Selected role
     */
    const handleRoleFilter = useCallback((role) => {
        setSelectedRole(role);
        if (role === "") {
            setUsers(allUsers);
        } else {
            const filteredUsers = allUsers.filter(user => user.role === role);
            setUsers(filteredUsers);
        }
        // Clear selected users when filter changes
        setAssignedTo([]);
    }, [allUsers]);

    /**
     * Handles select all users by role
     * 
     * @param {string} role - Role to select all users for
     */
    const handleSelectAllByRole = useCallback((role) => {
        const roleUsers = allUsers.filter(user => user.role === role);
        setAssignedTo(roleUsers);
    }, [allUsers]);

    /**
     * Handles form submission
     * 
     * @param {React.FormEvent} e - Form submit event
     */
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (assignedTo.length === 0) {
            alert('Please select at least one user to reassign the training');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_ENDPOINTS.REASSIGN_TRAINING}`, {
                method: "POST",
                headers: buildAuthHeaders(),
                body: JSON.stringify({
                    assignedTo: assignedTo.map(user => user.value),
                    trainingId: id,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to reassign training');
            }

            alert(result.message || 'Training reassigned successfully');
            window.location.reload();
        } catch (error) {
            console.error('Error reassigning training:', error);
            setError(error.message || 'Failed to reassign training');
            alert(error.message || 'Failed to reassign training. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }, [assignedTo, id]);

    if (isLoading) {
        return (
            <div className="w-full h-full bg-white text-black">
                <Header name="Reassign Training" />
                <SideNav />
                <div className="md:ml-[100px] mt-[150px]">
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                </div>
            </div>
        );
    }

    if (error && !training) {
        return (
            <div className="w-full h-full bg-white text-black">
                <Header name="Reassign Training" />
                <SideNav />
                <div className="md:ml-[100px] mt-[150px]">
                    <div className="text-center py-8 text-red-500">{error}</div>
                </div>
            </div>
        );
    }

    const trainingData = training?.data || {};
    const modules = trainingData.modules || [];
    const assignedUsers = training?.users || [];

    return (
        <div className="w-full h-full bg-white text-black">
            <Header name="Reassign Training" />
            <SideNav />

            <div className="md:ml-[100px] mt-[150px]">
                {/* Training Info Section */}
                <div className="text-xl mt-10">
                    <div className="flex justify-evenly flex-wrap gap-4">
                        <p>
                            Training Name: <span className="text-[#016E5B] font-semibold">{trainingData.trainingName || 'N/A'}</span>
                        </p>
                        <p>
                            Number of Modules: <span className="text-[#016E5B] font-semibold">{trainingData.numberOfModules || 0}</span>
                        </p>
                        <p>
                            Number of users: <span className="text-[#016E5B] font-semibold">{assignedUsers.length}</span>
                        </p>
                    </div>
                </div>

                <div className="flex mx-32 justify-between mt-10 flex-wrap gap-10">
                    {/* Modules List */}
                    <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-4">Training Modules</h3>
                        {modules.length === 0 ? (
                            <p className="text-gray-500">No modules found</p>
                        ) : (
                            modules.map((module) => (
                                <div className="text-xl mt-5" key={module._id}>
                                    Module {module.moduleName || 'Untitled'} has {module.videos?.length || 0} video{module.videos?.length !== 1 ? 's' : ''}
                                    <ul className="text-[16px] text-[#016E5B] list-disc list-inside ml-4">
                                        {module.videos?.map((video) => (
                                            <li key={video._id} title={video.title}>
                                                {video.title && video.title.length > 30 
                                                    ? `${video.title.slice(0, 30)}...`
                                                    : video.title || 'Untitled Video'}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Reassign Form */}
                    <div className="mt-5 flex justify-start items-start">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full max-w-md">
                            {/* Role Filter */}
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Filter by Role:
                                </label>
                                <select
                                    value={selectedRole}
                                    onChange={(e) => handleRoleFilter(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#016E5B]"
                                    disabled={isSubmitting}
                                >
                                    <option value="">All Roles</option>
                                    {availableRoles.map((role, index) => (
                                        <option key={index} value={role}>
                                            {role}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Quick Select Button */}
                            {selectedRole && (
                                <div className="w-full">
                                    <button
                                        type="button"
                                        onClick={() => handleSelectAllByRole(selectedRole)}
                                        className="px-4 py-2 bg-[#016E5B] text-white rounded-md hover:bg-[#014C3F] text-sm transition-colors disabled:opacity-50"
                                        disabled={isSubmitting}
                                    >
                                        Select All {selectedRole}s
                                    </button>
                                </div>
                            )}

                            {/* User Selection */}
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Users:
                                </label>
                                <Select
                                    placeholder="Select or search users"
                                    options={users}
                                    isMulti
                                    value={assignedTo}
                                    onChange={setAssignedTo}
                                    className="w-full"
                                    isSearchable={true}
                                    maxMenuHeight={200}
                                    isDisabled={isSubmitting}
                                />
                            </div>

                            {/* Selected Users Count */}
                            {assignedTo.length > 0 && (
                                <div className="text-sm text-gray-600">
                                    Selected: {assignedTo.length} user{assignedTo.length !== 1 ? 's' : ''}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="btn text-white bg-[#016E5B] hover:bg-[#014C3F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                disabled={isSubmitting || assignedTo.length === 0}
                            >
                                {isSubmitting ? 'Reassigning...' : `Reassign Training (${assignedTo.length} users)`}
                            </button>

                            {error && (
                                <div className="text-red-500 text-sm">{error}</div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReassignData;
