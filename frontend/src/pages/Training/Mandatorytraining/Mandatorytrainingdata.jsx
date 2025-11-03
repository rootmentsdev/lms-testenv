/**
 * Mandatory Training Data Component
 * 
 * Creates mandatory training assignments for specific designations
 * Supports multi-module selection and assignment to multiple designations
 * 
 * @returns {JSX.Element} - Mandatory training data component
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
    CREATE_MANDATORY_TRAINING: 'api/mandatorytrainings',
};

/**
 * Employee range for API calls
 */
const EMPLOYEE_RANGE = {
    START: 'EMP1',
    END: 'EMP9999',
};

/**
 * MongoDB ObjectId validation regex
 */
const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

/**
 * Validates if a string is a valid MongoDB ObjectId
 * 
 * @param {string} value - Value to validate
 * @returns {boolean} - True if valid ObjectId
 */
const isObjectId = (value) => OBJECT_ID_REGEX.test(String(value || ""));

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
 * Mandatory Training Data Component
 */
const Mandatorytrainingdata = () => {
    const [modules, setModules] = useState([]);
    const [roleOptions, setRoleOptions] = useState([]);
    const [trainingName, setTrainingName] = useState("");
    const [assignedTo, setAssignedTo] = useState([]);
    const [selectedModules, setSelectedModules] = useState([]);
    const [days, setDays] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * Fetches modules from API
     */
    const fetchModules = useCallback(async () => {
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_ENDPOINTS.GET_MODULES}`, {
                method: "GET",
                headers: buildAuthHeaders(),
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const moduleOptions = (Array.isArray(data) ? data : [])
                .map((m) => {
                    const id = m?._id ?? m?.id ?? m?.moduleId;
                    if (!isObjectId(id)) return null;
                    return {
                        value: String(id),
                        label: m?.moduleName || m?.name || "Unnamed Module",
                    };
                })
                .filter(Boolean);

            setModules(moduleOptions);
        } catch (error) {
            console.error("Modules fetch failed:", error);
            toast.error("Failed to load modules.");
        }
    }, []);

    /**
     * Fetches role/designation options from employee API
     */
    const fetchRoleOptions = useCallback(async () => {
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_ENDPOINTS.GET_EMPLOYEES}`, {
                method: "POST",
                headers: buildAuthHeaders(),
                credentials: "include",
                body: JSON.stringify({
                    startEmpId: EMPLOYEE_RANGE.START,
                    endEmpId: EMPLOYEE_RANGE.END,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const employeeData = data?.data || [];

            // Extract unique roles from employee data
            const uniqueRoles = Array.from(
                new Set(
                    employeeData
                        .map((e) => e?.role_name?.trim())
                        .filter(Boolean)
                )
            ).sort((a, b) => a.localeCompare(b));

            // Convert to react-select options format
            const options = uniqueRoles.map((role) => ({
                value: role,
                label: role,
            }));

            setRoleOptions(options);
        } catch (error) {
            console.error("Employee roles fetch failed:", error);
            toast.error("Failed to load employee designations.");
        }
    }, []);

    useEffect(() => {
        setIsLoading(true);
        Promise.all([fetchModules(), fetchRoleOptions()]).finally(() => {
            setIsLoading(false);
        });
    }, [fetchModules, fetchRoleOptions]);

    /**
     * Handles module selection change with validation
     * 
     * @param {Array} selectedOptions - Selected module options
     */
    const handleModuleChange = useCallback((selectedOptions) => {
        const validModules = (selectedOptions || []).filter((o) => isObjectId(o?.value));
        setSelectedModules(validModules);
    }, []);

    /**
     * Handles designation selection change with validation
     * 
     * @param {Array} selectedOptions - Selected designation options
     */
    const handleDesignationChange = useCallback((selectedOptions) => {
        const validDesignations = (selectedOptions || [])
            .map((o) => String(o?.value ?? "").trim())
            .filter(Boolean)
            .map((value) => {
                const option = roleOptions.find((r) => r.value === value);
                return option || { value, label: value };
            });
        setAssignedTo(validDesignations);
    }, [roleOptions]);

    /**
     * Validates form before submission
     * 
     * @returns {boolean} - True if form is valid
     */
    const validateForm = useCallback(() => {
        if (!trainingName.trim()) {
            toast.error("Enter a training name.");
            return false;
        }

        const dayCount = Number(days);
        if (!Number.isFinite(dayCount) || dayCount <= 0) {
            toast.error("Days must be a positive number.");
            return false;
        }

        const moduleIds = selectedModules
            .map((o) => String(o?.value ?? "").trim())
            .filter((id) => isObjectId(id));

        if (moduleIds.length === 0) {
            toast.error("Select at least one module (valid ID).");
            return false;
        }

        const designations = assignedTo
            .map((o) => String(o?.value ?? "").trim())
            .filter(Boolean);

        if (designations.length === 0) {
            toast.error("Select at least one designation.");
            return false;
        }

        return true;
    }, [trainingName, days, selectedModules, assignedTo]);

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
            const moduleIds = selectedModules
                .map((o) => String(o?.value ?? "").trim())
                .filter((id) => isObjectId(id));

            const designations = assignedTo
                .map((o) => String(o?.value ?? "").trim())
                .filter(Boolean);

            const dayCount = Number(days);

            const payload = {
                trainingName: trainingName.trim(),
                modules: moduleIds,
                days: dayCount,
                workingBranch: designations,
            };

            const response = await fetch(
                `${API_CONFIG.baseUrl}${API_ENDPOINTS.CREATE_MANDATORY_TRAINING}`,
                {
                    method: "POST",
                    headers: buildAuthHeaders(),
                    credentials: "include",
                    body: JSON.stringify(payload),
                }
            );

            const text = await response.text();
            let data;

            try {
                data = JSON.parse(text || "{}");
            } catch {
                data = { message: text };
            }

            if (!response.ok) {
                throw new Error(data?.error || data?.message || `HTTP ${response.status} ${response.statusText}`);
            }

            toast.success(data?.message || "Training created successfully!");

            // Reset form
            setTrainingName("");
            setDays("");
            setSelectedModules([]);
            setAssignedTo([]);
        } catch (error) {
            console.error("Submit failed:", error);
            const errorMessage = String(error?.message || "Server Error");

            if (errorMessage.includes("No users found")) {
                toast.error(
                    `${errorMessage}\n\nTip: Make sure the designation names match exactly with the available options.`
                );
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [trainingName, days, selectedModules, assignedTo, validateForm]);

    return (
        <div>
            <div className="w-full h-full bg-white">
                <Header name="Mandatory training" />
            </div>
            <SideNav />

            <div className="md:ml-[100px] mt-[150px]">
                <form onSubmit={handleSubmit} className="text-black w-[800px] mt-10">
                    {/* Training Name */}
                    <div className="flex flex-col gap-5 mx-20 mt-5">
                        <div className="flex flex-col gap-2">
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
                        <div className="flex flex-col gap-2">
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

                    {/* Modules */}
                    <div className="flex flex-col gap-2 mx-20 mt-5">
                        <label className="font-medium">Modules *</label>
                        <Select
                            placeholder="Select module(s)…"
                            options={modules}
                            isMulti
                            value={selectedModules}
                            onChange={handleModuleChange}
                            className="w-full"
                            isDisabled={isSubmitting || isLoading}
                            isSearchable={true}
                        />
                        {modules.length === 0 && !isLoading && (
                            <p className="text-sm text-gray-500">No modules available</p>
                        )}
                    </div>

                    {/* Assign To Designation */}
                    <div className="flex flex-col gap-2 mx-20 mt-5">
                        <label className="font-medium">Assign To Designation *</label>
                        <Select
                            placeholder="Select designation(s)…"
                            options={roleOptions}
                            isMulti
                            value={assignedTo}
                            onChange={handleDesignationChange}
                            className="w-full"
                            isDisabled={isSubmitting || isLoading}
                            isSearchable={true}
                        />
                        {roleOptions.length === 0 && isLoading && (
                            <p className="text-sm text-gray-500">Loading designations...</p>
                        )}
                        {roleOptions.length === 0 && !isLoading && (
                            <p className="text-sm text-gray-500">No designations available</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="mt-10 mx-20">
                        <button
                            type="submit"
                            className="border border-black p-2 px-6 rounded-lg bg-[#016E5B] hover:bg-[#014C3F] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting || isLoading}
                        >
                            {isSubmitting ? 'Assigning Training...' : 'Assign Training'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Mandatorytrainingdata;
