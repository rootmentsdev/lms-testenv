/**
 * Create Admin Component
 * 
 * Handles creation of new admin users with role-based configuration
 * Supports Super Admin, Cluster Manager, and Store Manager roles
 * 
 * @returns {JSX.Element} - Create admin component
 */
import { useEffect, useState, useCallback } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import API_CONFIG from "../../api/api";

/**
 * API endpoints
 */
const API_ENDPOINTS = {
    CREATE_ADMIN: 'api/admin/admin/createadmin',
    GET_BRANCHES: 'api/usercreate/getBranch',
    GET_SUBROLES: 'api/admin/getSubrole',
};

/**
 * Role mapping configuration
 */
const ROLE_OPTIONS = {
    USER: 'user',
    DESIGNATION: 'designation',
    BRANCH: 'branch',
};

const ROLE_MAPPING = {
    [ROLE_OPTIONS.USER]: 'super_admin',
    [ROLE_OPTIONS.DESIGNATION]: 'cluster_admin',
    [ROLE_OPTIONS.BRANCH]: 'store_admin',
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
 * @param {string|null} token - Authentication token
 * @returns {Object} - Headers object
 */
const buildAuthHeaders = (token) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

/**
 * Create Admin Component
 */
const CreateUser = () => {
    const [users, setUsers] = useState([]);
    const [assignedTo, setAssignedTo] = useState([]);
    const [selectedOption, setSelectedOption] = useState(ROLE_OPTIONS.USER);
    const [showPassword, setShowPassword] = useState(false);
    const [subroles, setSubroles] = useState([]);
    const token = getAuthToken();

    const [form, setForm] = useState({
        userId: "",
        userName: "",
        email: "",
        userRole: "",
        clusterBranch: "",
        password: "",
        Branch: [],
    });

    /**
     * Handles input field changes
     * 
     * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} e - Input change event
     */
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }, []);

    /**
     * Fetches branch data for selection
     */
    const fetchBranches = useCallback(async () => {
        if (!token) return;

        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_ENDPOINTS.GET_BRANCHES}`, {
                method: "GET",
                headers: buildAuthHeaders(token),
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to fetch branch data");
            }

            const data = await response.json();
            setUsers(
                (data.data || []).map((item) => ({
                    value: item._id,
                    label: item.workingBranch,
                }))
            );
        } catch (error) {
            console.error("Error fetching branches:", error.message);
            toast.error("Failed to fetch branch data.");
        }
    }, [token]);

    /**
     * Fetches subrole data
     */
    const fetchSubroles = useCallback(async () => {
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_ENDPOINTS.GET_SUBROLES}`);
            
            if (!response.ok) {
                throw new Error("Failed to fetch subroles");
            }

            const data = await response.json();
            setSubroles(data.subrole || []);
        } catch (error) {
            console.error("Error fetching subroles:", error.message);
            toast.error("Failed to fetch subroles.");
        }
    }, []);

    /**
     * Handles form submission
     * 
     * @param {React.FormEvent} e - Form submit event
     */
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        // Map selected option to role
        const userRole = ROLE_MAPPING[selectedOption] || ROLE_MAPPING[ROLE_OPTIONS.USER];

        const updatedForm = {
            ...form,
            userRole,
            Branch: Array.isArray(assignedTo)
                ? assignedTo.map((branch) => branch.value)
                : assignedTo?.value ? [assignedTo.value] : [],
            subRole: form.subRole || null,
        };

        // Validate required fields
        if (!updatedForm.userId || !updatedForm.userName || !updatedForm.email) {
            toast.warning("Please fill in all required fields.");
            return;
        }

        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_ENDPOINTS.CREATE_ADMIN}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedForm),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to save changes");
            }

            const result = await response.json();
            toast.success("User created successfully!");
            console.log("Response from backend:", result);
            
            // Reset form after successful creation
            setForm({
                userId: "",
                userName: "",
                email: "",
                userRole: "",
                clusterBranch: "",
                password: "",
                Branch: [],
            });
            setAssignedTo([]);
        } catch (error) {
            console.error("Error saving user:", error.message);
            toast.error("An error occurred while saving the user. Please try again.");
        }
    }, [form, selectedOption, assignedTo]);

    /**
     * Handles role option change
     * 
     * @param {string} option - Selected role option
     */
    const handleRoleOptionChange = useCallback((option) => {
        setSelectedOption(option);
        setAssignedTo([]);
    }, []);

    /**
     * Toggles password visibility
     */
    const togglePasswordVisibility = useCallback(() => {
        setShowPassword((prev) => !prev);
    }, []);

    useEffect(() => {
        fetchBranches();
        fetchSubroles();
    }, [fetchBranches, fetchSubroles]);

    return (
        <div className="p-6 bg-gray-50 min-h-screen flex text-black justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
                <h1 className="text-2xl font-bold mb-6">Create User/Admin</h1>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* User ID */}
                    <div>
                        <label htmlFor="userId" className="block text-sm font-semibold text-gray-700">
                            User ID
                        </label>
                        <input
                            type="text"
                            id="userId"
                            name="userId"
                            value={form.userId}
                            onChange={handleInputChange}
                            placeholder="Enter employee ID"
                            className="mt-2 block w-full p-2 border bg-white border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                            required
                        />
                    </div>

                    {/* User Name */}
                    <div>
                        <label htmlFor="userName" className="block text-sm font-semibold text-gray-700">
                            User Name
                        </label>
                        <input
                            type="text"
                            id="userName"
                            name="userName"
                            value={form.userName}
                            onChange={handleInputChange}
                            placeholder="Enter employee name"
                            className="mt-2 block w-full p-2 border bg-white border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={form.email}
                            onChange={handleInputChange}
                            placeholder="Enter employee email address"
                            className="mt-2 block w-full p-2 border bg-white border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                            Password
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            value={form.password}
                            onChange={handleInputChange}
                            placeholder="Enter Password"
                            className="mt-2 block w-full p-2 pr-10 border bg-white border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        />
                        <div 
                            className="absolute top-10 right-5 cursor-pointer text-gray-600 hover:text-gray-800"
                            onClick={togglePasswordVisibility}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    togglePasswordVisibility();
                                }
                            }}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div className="flex flex-col gap-4">
                        <label htmlFor="assignToType" className="block text-gray-700 font-medium">
                            Role
                        </label>
                        <div className="flex gap-5">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    value={ROLE_OPTIONS.USER}
                                    checked={selectedOption === ROLE_OPTIONS.USER}
                                    onChange={() => handleRoleOptionChange(ROLE_OPTIONS.USER)}
                                    className="mr-2"
                                />
                                Super Admin
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    value={ROLE_OPTIONS.DESIGNATION}
                                    checked={selectedOption === ROLE_OPTIONS.DESIGNATION}
                                    onChange={() => handleRoleOptionChange(ROLE_OPTIONS.DESIGNATION)}
                                    className="mr-2"
                                />
                                Cluster Manager
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    value={ROLE_OPTIONS.BRANCH}
                                    checked={selectedOption === ROLE_OPTIONS.BRANCH}
                                    onChange={() => handleRoleOptionChange(ROLE_OPTIONS.BRANCH)}
                                    className="mr-2"
                                />
                                Store Manager
                            </label>
                        </div>

                        {/* Sub Role Selection (for Super Admin) */}
                        {selectedOption === ROLE_OPTIONS.USER && (
                            <div>
                                <label htmlFor="subRole" className="block text-sm font-semibold text-gray-700">
                                    Sub Role
                                </label>
                                <select
                                    id="subRole"
                                    name="subRole"
                                    value={form.subRole || ""}
                                    onChange={handleInputChange}
                                    className="mt-2 block w-full p-2 border bg-white border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                >
                                    <option value="">Select Sub Role</option>
                                    {subroles.map((item) => (
                                        <option key={item._id} value={item.level}>
                                            {item.subrole}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Branch/Designation Selection */}
                        {(selectedOption === ROLE_OPTIONS.DESIGNATION || selectedOption === ROLE_OPTIONS.BRANCH) && (
                            <Select
                                placeholder="Select the users"
                                id="assignToUsers"
                                options={users}
                                isMulti={selectedOption === ROLE_OPTIONS.DESIGNATION}
                                value={assignedTo}
                                onChange={setAssignedTo}
                                className="w-full"
                            />
                        )}
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300 transition-colors"
                        >
                            Save User
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateUser;
