/**
 * Create Training Datas Component
 * 
 * Creates new training assignments with module selection
 * Supports assigning to users, designations, or branches
 * 
 * @returns {JSX.Element} - Create training data component
 */
import { useEffect, useState, useCallback } from "react";
import Select from "react-select";
import { toast } from "react-toastify";

import Header from "../../../components/Header/Header";
import SideNav from "../../../components/SideNav/SideNav";
import API_CONFIG from "../../../api/api";

/**
 * API endpoints
 */
const API_ENDPOINTS = {
    GET_MODULES: 'api/modules',
    GET_EMPLOYEES: 'api/employee_range',
    CREATE_TRAINING: 'api/trainings',
};

/**
 * Assignment type options
 */
const ASSIGNMENT_TYPES = {
    USER: 'user',
    DESIGNATION: 'designation',
    BRANCH: 'branch',
};

/**
 * Employee range for API calls
 */
const EMPLOYEE_RANGE = {
    START: 'EMP1',
    END: 'EMP9999',
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
 * Create Training Datas Component
 */
const CreateTrainingDatas = () => {
    const [modules, setModules] = useState([]);
    const [users, setUsers] = useState([]);
    const [trainingName, setTrainingName] = useState("");
    const [assignedTo, setAssignedTo] = useState([]);
    const [selectedModules, setSelectedModules] = useState([]);
    const [days, setDays] = useState("");
    const [selectedOption, setSelectedOption] = useState(ASSIGNMENT_TYPES.USER);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * Fetches modules from API
     */
    const fetchModules = useCallback(async () => {
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_ENDPOINTS.GET_MODULES}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const moduleOptions = (Array.isArray(data) ? data : []).map((module) => ({
                value: module.moduleId,
                label: module.moduleName || 'Unnamed Module',
            }));

            setModules(moduleOptions);
        } catch (error) {
            console.error("Failed to fetch modules:", error.message);
            toast.error("Failed to load modules. Please try again.");
        }
    }, []);

    /**
     * Maps employee data to options based on selected assignment type
     * 
     * @param {Array} employeeData - Employee data array
     * @param {string} assignmentType - Type of assignment (user, designation, branch)
     * @returns {Array} - Mapped options array
     */
    const mapEmployeesToOptions = useCallback((employeeData, assignmentType) => {
        if (assignmentType === ASSIGNMENT_TYPES.BRANCH) {
            const uniqueBranches = [...new Set(employeeData.map(emp => emp.store_name).filter(Boolean))];
            return uniqueBranches.map((branch) => ({
                value: branch,
                label: branch,
            }));
        }

        if (assignmentType === ASSIGNMENT_TYPES.USER) {
            return employeeData.map((employee) => ({
                value: employee.emp_code,
                label: `EmpId: ${employee.emp_code || 'N/A'} | Name: ${employee.name || 'N/A'} | Role: ${employee.role_name || 'N/A'}`,
            }));
        }

        if (assignmentType === ASSIGNMENT_TYPES.DESIGNATION) {
            const uniqueRoles = [...new Set(employeeData.map(emp => emp.role_name).filter(Boolean))];
            return uniqueRoles.map((role) => ({
                value: role,
                label: role,
            }));
        }

        return [];
    }, []);

    /**
     * Fetches users/employees based on selected assignment type
     */
    const fetchUsers = useCallback(async () => {
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_ENDPOINTS.GET_EMPLOYEES}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    startEmpId: EMPLOYEE_RANGE.START,
                    endEmpId: EMPLOYEE_RANGE.END,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const employeeData = data?.data || [];
            const options = mapEmployeesToOptions(employeeData, selectedOption);

            setUsers(options);
        } catch (error) {
            console.error("Failed to fetch users:", error.message);
            toast.error("Failed to load users. Please try again.");
        }
    }, [selectedOption, mapEmployeesToOptions]);

    useEffect(() => {
        fetchModules();
    }, [fetchModules]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    /**
     * Handles assignment type change
     * 
     * @param {string} type - New assignment type
     */
    const handleAssignmentTypeChange = useCallback((type) => {
        setSelectedOption(type);
        setAssignedTo([]); // Clear selection when type changes
    }, []);

    /**
     * Validates form before submission
     * 
     * @returns {boolean} - True if form is valid
     */
    const validateForm = useCallback(() => {
        if (!trainingName.trim()) {
            toast.error("Training name is required");
            return false;
        }

        if (selectedModules.length === 0) {
            toast.error("Please select at least one module");
            return false;
        }

        const daysNumber = parseInt(days, 10);
        if (!days || isNaN(daysNumber) || daysNumber <= 0) {
            toast.error("Please enter a valid number of days");
            return false;
        }

        if (assignedTo.length === 0) {
            toast.error(`Please select at least one ${selectedOption} to assign the training to`);
            return false;
        }

        return true;
    }, [trainingName, selectedModules, days, assignedTo, selectedOption]);

    /**
     * Handles form submission
     * 
     * @param {React.FormEvent} e - Form submit event
     */
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const trainingData = {
                trainingName: trainingName.trim(),
                workingBranch: assignedTo.map((item) => item.value),
                modules: selectedModules.map((item) => item.value),
                days: parseInt(days, 10),
                selectedOption,
            };

            const response = await fetch(`${API_CONFIG.baseUrl}${API_ENDPOINTS.CREATE_TRAINING}`, {
                method: "POST",
                headers: buildAuthHeaders(),
                body: JSON.stringify(trainingData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to create training");
            }

            toast.success(data.message || "Training created successfully!");

            // Clear form after successful creation
            setTrainingName("");
            setSelectedModules([]);
            setAssignedTo([]);
            setDays("");
        } catch (error) {
            console.error("Failed to submit training:", error);
            toast.error(error.message || "Error submitting training.");
        } finally {
            setIsSubmitting(false);
        }
    }, [trainingName, selectedModules, days, assignedTo, selectedOption, validateForm]);

    return (
        <div>
            <div className="w-full h-full bg-white">
                <Header name="Assign new Training" />
            </div>
            <SideNav />

            <div className="md:ml-[100px] mt-[150px]">
                <form onSubmit={handleSubmit} className="text-black w-[800px] mt-10">
                    {/* Training Name */}
                    <div className="flex flex-col gap-5 mx-20 mt-5">
                        <div className="flex flex-col gap-5">
                            <label htmlFor="trainingName" className="font-medium">
                                Training Name *
                            </label>
                            <input
                                id="trainingName"
                                type="text"
                                placeholder="Training title"
                                className="bg-white border p-2 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-[#016E5B] focus:border-[#016E5B]"
                                value={trainingName}
                                onChange={(e) => setTrainingName(e.target.value)}
                                disabled={isSubmitting}
                                required
                            />
                        </div>
                    </div>

                    {/* Days */}
                    <div className="flex flex-col gap-5 mx-20 mt-5">
                        <div className="flex flex-col gap-5">
                            <label htmlFor="days" className="font-medium">
                                Days to Complete *
                            </label>
                            <input
                                id="days"
                                type="number"
                                min="1"
                                placeholder="Number of days"
                                className="bg-white w-full border p-2 rounded-lg border-gray-300 focus:ring-2 focus:ring-[#016E5B] focus:border-[#016E5B]"
                                value={days}
                                onChange={(e) => setDays(e.target.value)}
                                disabled={isSubmitting}
                                required
                            />
                        </div>
                    </div>

                    {/* Modules Dropdown */}
                    <div className="flex flex-col gap-5 mx-20 mt-5">
                        <label className="font-medium">Modules *</label>
                        <Select
                            placeholder="Select modules"
                            options={modules}
                            isMulti
                            value={selectedModules}
                            onChange={setSelectedModules}
                            className="w-full"
                            isDisabled={isSubmitting || modules.length === 0}
                            isSearchable={true}
                        />
                        {modules.length === 0 && (
                            <p className="text-sm text-gray-500">No modules available</p>
                        )}
                    </div>

                    {/* Assign To Section */}
                    <div className="flex flex-col gap-1 mx-20 mt-5">
                        <label className="font-medium mb-2">Assign To *</label>
                        <div className="flex flex-col gap-5 mx-20 mt-5">
                            <div className="flex gap-5">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        value={ASSIGNMENT_TYPES.USER}
                                        checked={selectedOption === ASSIGNMENT_TYPES.USER}
                                        onChange={(e) => handleAssignmentTypeChange(e.target.value)}
                                        disabled={isSubmitting}
                                        className="text-[#016E5B]"
                                    />
                                    <span>User</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        value={ASSIGNMENT_TYPES.DESIGNATION}
                                        checked={selectedOption === ASSIGNMENT_TYPES.DESIGNATION}
                                        onChange={(e) => handleAssignmentTypeChange(e.target.value)}
                                        disabled={isSubmitting}
                                        className="text-[#016E5B]"
                                    />
                                    <span>Designation</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        value={ASSIGNMENT_TYPES.BRANCH}
                                        checked={selectedOption === ASSIGNMENT_TYPES.BRANCH}
                                        onChange={(e) => handleAssignmentTypeChange(e.target.value)}
                                        disabled={isSubmitting}
                                        className="text-[#016E5B]"
                                    />
                                    <span>Branch</span>
                                </label>
                            </div>
                        </div>
                        <Select
                            placeholder={`Select ${selectedOption === ASSIGNMENT_TYPES.USER ? 'users' : selectedOption === ASSIGNMENT_TYPES.DESIGNATION ? 'designations' : 'branches'}`}
                            options={users}
                            isMulti
                            value={assignedTo}
                            onChange={setAssignedTo}
                            className="w-full"
                            isDisabled={isSubmitting || users.length === 0}
                            isSearchable={true}
                        />
                        {users.length === 0 && (
                            <p className="text-sm text-gray-500">No {selectedOption} options available</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="mt-10 mx-20">
                        <button
                            type="submit"
                            className="border border-black p-2 px-6 rounded-lg bg-[#016E5B] hover:bg-[#014C3F] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Creating Training...' : 'Assign Training'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTrainingDatas;
