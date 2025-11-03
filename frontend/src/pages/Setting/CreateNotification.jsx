/**
 * Create Custom Notification Component
 * 
 * Handles creation and sending of custom notifications to users, branches, or designations
 * Supports in-app notification delivery
 * 
 * @returns {JSX.Element} - Create custom notification component
 */
import { useEffect, useState, useCallback } from "react";
import Select from "react-select";
import { toast } from "react-toastify";

import API_CONFIG from "../../api/api";

/**
 * API endpoints
 */
const API_ENDPOINTS = {
    GET_ALL_USERS: 'api/usercreate/getAllUser',
    GET_BRANCHES: 'api/usercreate/getBranch',
    GET_DESIGNATIONS: 'api/employee_range',
    CREATE_NOTIFICATION: 'api/admin/notification/create',
};

/**
 * Recipient type options
 */
const RECIPIENT_TYPES = {
    USER: 'user',
    DESIGNATION: 'designation',
    BRANCH: 'branch',
};

/**
 * Delivery methods
 */
const DELIVERY_METHODS = {
    IN_APP: 'inApp',
};

/**
 * Employee ID range for designation fetching
 */
const EMPLOYEE_ID_RANGE = {
    START: "EMP1",
    END: "EMP9999",
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
 * Create Custom Notification Component
 */
const CreateCustomNotification = () => {
    const [users, setUsers] = useState([]);
    const [assignedTo, setAssignedTo] = useState([]);
    const [selectedOption, setSelectedOption] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const token = getAuthToken();

    const [form, setForm] = useState({
        title: "",
        message: "",
        recipient: [],
        role: "",
        deliveryMethod: DELIVERY_METHODS.IN_APP,
    });

    /**
     * Handles input field changes
     * 
     * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - Input change event
     */
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }, []);

    /**
     * Handles recipient selection change
     * 
     * @param {Array} selectedOptions - Selected options from Select component
     */
    const handleAssignedToChange = useCallback((selectedOptions) => {
        setAssignedTo(selectedOptions || []);
        setForm((prev) => ({
            ...prev,
            recipient: (selectedOptions || []).map((option) => option.value),
        }));
    }, []);

    /**
     * Fetches users based on selected recipient type
     */
    const fetchUsers = useCallback(async () => {
        if (!selectedOption || !token) {
            setUsers([]);
            return;
        }

        setIsLoadingUsers(true);
        try {
            let options = [];

            if (selectedOption === RECIPIENT_TYPES.USER) {
                const response = await fetch(
                    `${API_CONFIG.baseUrl}${API_ENDPOINTS.GET_ALL_USERS}`,
                    {
                        method: "GET",
                        headers: buildAuthHeaders(token),
                        credentials: "include",
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    options = (data.data || []).map((item) => ({
                        value: item._id,
                        label: item.username,
                    }));
                }
            } else if (selectedOption === RECIPIENT_TYPES.BRANCH) {
                const response = await fetch(
                    `${API_CONFIG.baseUrl}${API_ENDPOINTS.GET_BRANCHES}`,
                    {
                        method: "GET",
                        headers: buildAuthHeaders(token),
                        credentials: "include",
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    options = (data.data || []).map((item) => ({
                        value: item.locCode,
                        label: item.workingBranch,
                    }));
                }
            } else if (selectedOption === RECIPIENT_TYPES.DESIGNATION) {
                const response = await fetch(
                    `${API_CONFIG.baseUrl}${API_ENDPOINTS.GET_DESIGNATIONS}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({
                            startEmpId: EMPLOYEE_ID_RANGE.START,
                            endEmpId: EMPLOYEE_ID_RANGE.END,
                        }),
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    const uniqueDesignations = [
                        ...new Set(
                            (data?.data || [])
                                .map((emp) => emp.role_name)
                                .filter(Boolean)
                        ),
                    ].sort();

                    options = uniqueDesignations.map((designation) => ({
                        value: designation,
                        label: designation,
                    }));
                }
            }

            setUsers(options);
        } catch (error) {
            console.error("Failed to fetch users:", error.message);
            toast.error("Failed to fetch recipient data");
            setUsers([]);
        } finally {
            setIsLoadingUsers(false);
        }
    }, [selectedOption, token]);

    /**
     * Handles recipient type change
     * 
     * @param {string} option - Selected recipient type
     */
    const handleRecipientTypeChange = useCallback((option) => {
        setSelectedOption(option);
        setAssignedTo([]);
        setForm((prev) => ({
            ...prev,
            recipient: [],
            role: option,
        }));
    }, []);

    /**
     * Handles form submission
     * 
     * @param {React.FormEvent} e - Form submit event
     */
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch(
                `${API_CONFIG.baseUrl}${API_ENDPOINTS.CREATE_NOTIFICATION}`,
                {
                    method: "POST",
                    headers: buildAuthHeaders(token),
                    body: JSON.stringify(form),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                toast.warning(result.message || "Failed to send notification");
                throw new Error(result.message || "Failed to send notification");
            }

            toast.success(result.message || "Notification sent successfully!");
            
            // Reset form after successful submission
            setForm({
                title: "",
                message: "",
                recipient: [],
                role: "",
                deliveryMethod: DELIVERY_METHODS.IN_APP,
            });
            setAssignedTo([]);
            setSelectedOption("");
        } catch (error) {
            console.error("Failed to send notification:", error.message);
        } finally {
            setIsSubmitting(false);
        }
    }, [form, token]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return (
        <div className="p-6 bg-gray-50 min-h-screen text-black flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
                <h1 className="text-2xl font-bold mb-6">Create Custom Notification</h1>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Notification Title */}
                    <div>
                        <label
                            htmlFor="title"
                            className="block text-sm font-semibold text-gray-700"
                        >
                            Notification Title/ Subject
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={form.title}
                            onChange={handleInputChange}
                            placeholder="Enter notification title / subject"
                            className="mt-2 block w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-green-500 focus:border-green-500"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Message Content */}
                    <div>
                        <label
                            htmlFor="message"
                            className="block text-sm font-semibold text-gray-700"
                        >
                            Message Content
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            value={form.message}
                            onChange={handleInputChange}
                            placeholder="Type your message here..."
                            rows="4"
                            className="mt-2 block w-full p-2 border bg-white border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Recipient Selection */}
                    <div className="flex flex-col gap-4">
                        <label htmlFor="assignToType" className="block text-gray-700 font-medium">
                            Assign To
                        </label>
                        <div className="flex gap-5">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    value={RECIPIENT_TYPES.USER}
                                    checked={selectedOption === RECIPIENT_TYPES.USER}
                                    onChange={() => handleRecipientTypeChange(RECIPIENT_TYPES.USER)}
                                    className="mr-2"
                                    disabled={isSubmitting}
                                />
                                User
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    value={RECIPIENT_TYPES.DESIGNATION}
                                    checked={selectedOption === RECIPIENT_TYPES.DESIGNATION}
                                    onChange={() => handleRecipientTypeChange(RECIPIENT_TYPES.DESIGNATION)}
                                    className="mr-2"
                                    disabled={isSubmitting}
                                />
                                Designation
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    value={RECIPIENT_TYPES.BRANCH}
                                    checked={selectedOption === RECIPIENT_TYPES.BRANCH}
                                    onChange={() => handleRecipientTypeChange(RECIPIENT_TYPES.BRANCH)}
                                    className="mr-2"
                                    disabled={isSubmitting}
                                />
                                Branch
                            </label>
                        </div>
                        {selectedOption && (
                            <Select
                                placeholder={
                                    isLoadingUsers
                                        ? "Loading..."
                                        : "Select the recipients"
                                }
                                id="assignToUsers"
                                options={users}
                                isMulti
                                value={assignedTo}
                                onChange={handleAssignedToChange}
                                className="w-full"
                                isDisabled={isLoadingUsers || isSubmitting}
                            />
                        )}
                    </div>

                    {/* Delivery Methods */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Delivery Methods
                        </label>
                        <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="deliveryMethod"
                                    value={DELIVERY_METHODS.IN_APP}
                                    checked={form.deliveryMethod === DELIVERY_METHODS.IN_APP}
                                    onChange={handleInputChange}
                                    className="focus:ring-green-500 text-green-600 border-gray-300"
                                    disabled={isSubmitting}
                                />
                                <span>In-app Notification</span>
                            </label>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            disabled={isSubmitting || !selectedOption || assignedTo.length === 0}
                        >
                            {isSubmitting ? 'Sending...' : 'Send Now'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCustomNotification;
