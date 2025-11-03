/**
 * Branch Details Data Component
 * 
 * Displays and allows editing of branch information
 * Supports updating branch details like location, manager, address, and phone number
 * 
 * @returns {JSX.Element} - Branch details data component
 */
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { GoPencil } from "react-icons/go";
import { toast } from "react-toastify";

import Header from "../../../components/Header/Header";
import SideNav from "../../../components/SideNav/SideNav";
import API_CONFIG from "../../../api/api";

/**
 * API endpoints
 */
const API_ENDPOINTS = {
    GET_BRANCH: (branchId) => `api/admin/get/update/branch/${branchId}`,
    UPDATE_BRANCH: (branchId) => `api/admin/put/update/branch/${branchId}`,
};

/**
 * Route paths
 */
const ROUTE_PATHS = {
    BRANCHES: '/branch',
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
 * Formats field name for display
 * 
 * @param {string} key - Field key
 * @returns {string} - Formatted label
 */
const formatFieldLabel = (key) => {
    return key.replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, (c) => c.toUpperCase());
};

/**
 * Branch Details Data Component
 */
const BranchDetailsData = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [branchData, setBranchData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Fetches branch data from API
     */
    const fetchBranchData = useCallback(async () => {
        if (!id) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_ENDPOINTS.GET_BRANCH(id)}`, {
                method: 'GET',
                headers: buildAuthHeaders(),
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            const branch = result.branch || {};

            const normalizedData = {
                workingBranch: branch.workingBranch || "",
                locCode: branch.locCode || "",
                phoneNumber: branch.phoneNumber || "",
                location: branch.location || "",
                address: branch.address || "",
                manager: branch.manager || "",
            };

            setBranchData(normalizedData);
        } catch (error) {
            console.error("Error fetching branch data:", error);
            setError('Failed to load branch details');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchBranchData();
    }, [fetchBranchData]);

    /**
     * Handles input field changes
     * 
     * @param {React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>} e - Input change event
     */
    const handleChange = useCallback((e) => {
        const { id, value } = e.target;
        setBranchData((prev) => ({ ...prev, [id]: value }));
    }, []);

    /**
     * Handles save action
     */
    const handleSave = useCallback(async () => {
        if (!id) return;

        setIsSaving(true);
        setError(null);

        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_ENDPOINTS.UPDATE_BRANCH(id)}`, {
                method: 'PUT',
                headers: buildAuthHeaders(),
                body: JSON.stringify(branchData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to update branch');
            }

            toast.success(result.message || 'Branch updated successfully');
            await fetchBranchData();
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating branch:", error);
            toast.error(error.message || 'Failed to update branch');
            setError(error.message || 'An error occurred while updating');
        } finally {
            setIsSaving(false);
        }
    }, [id, branchData, fetchBranchData]);

    /**
     * Handles edit mode toggle
     */
    const handleEditToggle = useCallback(() => {
        if (isEditing) {
            handleSave();
        } else {
            setIsEditing(true);
        }
    }, [isEditing, handleSave]);

    /**
     * Handles back navigation
     */
    const handleBack = useCallback(() => {
        navigate(ROUTE_PATHS.BRANCHES);
    }, [navigate]);

    if (isLoading) {
        return (
            <div className="mb-[70px]">
                <Header name="Edit Branch" />
                <SideNav />
                <div className="p-6 mt-[150px] mx-10 bg-gray-50 min-h-screen ml-[200px] text-[#016E5B]">
                    <div className="text-center py-8 text-gray-500">Loading branch details...</div>
                </div>
            </div>
        );
    }

    if (error && Object.keys(branchData).length === 0) {
        return (
            <div className="mb-[70px]">
                <Header name="Edit Branch" />
                <SideNav />
                <div className="p-6 mt-[150px] mx-10 bg-gray-50 min-h-screen ml-[200px] text-[#016E5B]">
                    <div className="text-center py-8 text-red-500">{error}</div>
                    <Link to={ROUTE_PATHS.BRANCHES}>
                        <button className="mt-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
                            Go Back
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-[70px]">
            <Header name="Edit Branch" />
            <SideNav />

            <div className="p-6 mt-[150px] mx-10 bg-gray-50 min-h-screen ml-[200px] text-[#016E5B]">
                <Link to={ROUTE_PATHS.BRANCHES}>
                    <button
                        type="button"
                        className="text-sm text-gray-500 hover:underline mb-4 flex items-center"
                        onClick={handleBack}
                    >
                        ← Back
                    </button>
                </Link>

                <div className="grid grid-cols-2 gap-6">
                    {Object.keys(branchData).map((key) => (
                        <div key={key}>
                            <label htmlFor={key} className="block text-sm font-medium text-[#016E5B] mb-2">
                                {formatFieldLabel(key)}
                            </label>
                            {key === "address" ? (
                                <textarea
                                    id={key}
                                    value={branchData[key]}
                                    onChange={handleChange}
                                    disabled={!isEditing || isSaving}
                                    rows={4}
                                    className="mt-1 block w-[300px] rounded-[5px] border shadow-sm bg-white border-gray-500 focus:ring-green-500 focus:border-green-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            ) : (
                                <input
                                    id={key}
                                    type="text"
                                    value={branchData[key]}
                                    onChange={handleChange}
                                    disabled={!isEditing || isSaving}
                                    className="bg-white border-gray-500 h-10 mt-1 block w-[300px] rounded-[5px] border shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between mt-8">
                    <div className="flex space-x-4">
                        <button
                            type="button"
                            className="px-4 py-2 flex items-center gap-3 text-green-500 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
                            onClick={handleEditToggle}
                            disabled={isSaving}
                        >
                            <GoPencil />
                            {isSaving ? 'Saving...' : isEditing ? 'Save' : 'Edit'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 text-red-500 text-sm">{error}</div>
                )}
            </div>
        </div>
    );
};

export default BranchDetailsData;
