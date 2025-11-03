/**
 * Add Branch Data Component
 * 
 * Handles creation of new branches with form validation
 * Supports creating branches with location code, name, manager, address, and phone number
 * 
 * @returns {JSX.Element} - Add branch data component
 */
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Header from "../../components/Header/Header";
import SideNav from "../../components/SideNav/SideNav";
import API_CONFIG from "../../api/api";

/**
 * API endpoint for creating branches
 */
const CREATE_BRANCH_ENDPOINT = 'api/usercreate/create/branch';

/**
 * Initial branch form state
 */
const INITIAL_BRANCH_STATE = {
    address: "",
    locCode: "",
    location: "",
    manager: "",
    phoneNumber: "",
    workingBranch: "",
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
 * Validates branch form data
 * 
 * @param {Object} branchData - Branch form data
 * @returns {Object} - Validation result with isValid flag and error message
 */
const validateBranchData = (branchData) => {
    if (!branchData.locCode || !branchData.locCode.trim()) {
        return { isValid: false, message: 'Branch ID is required' };
    }
    if (!branchData.workingBranch || !branchData.workingBranch.trim()) {
        return { isValid: false, message: 'Branch Name is required' };
    }
    if (!branchData.manager || !branchData.manager.trim()) {
        return { isValid: false, message: 'Branch Manager is required' };
    }
    return { isValid: true, message: '' };
};

/**
 * Add Branch Data Component
 */
const BranchForm = () => {
    const navigate = useNavigate();
    const [branchData, setBranchData] = useState(INITIAL_BRANCH_STATE);
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * Handles input field changes
     * 
     * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
     */
    const handleChange = useCallback((e) => {
        const { id, value } = e.target;
        setBranchData((prev) => ({
            ...prev,
            [id]: value,
        }));
    }, []);

    /**
     * Handles form submission
     */
    const handleFormSubmit = useCallback(async () => {
        const validation = validateBranchData(branchData);
        
        if (!validation.isValid) {
            toast.warning(validation.message);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${CREATE_BRANCH_ENDPOINT}`, {
                method: 'POST',
                headers: buildAuthHeaders(),
                body: JSON.stringify(branchData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to create branch');
            }

            toast.success(result.message || 'Branch created successfully!');
            setBranchData(INITIAL_BRANCH_STATE);
            
            // Optionally navigate back after successful creation
            setTimeout(() => {
                navigate('/branch');
            }, 1500);
        } catch (error) {
            console.error('Error creating branch:', error);
            toast.error(error.message || 'Failed to create branch. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }, [branchData, navigate]);

    /**
     * Handles back navigation
     */
    const handleBack = useCallback(() => {
        navigate('/branch');
    }, [navigate]);

    return (
        <div className="mb-[70px]">
            <Header name="Add Branch" />
            <SideNav />

            <div className="p-6 mt-[150px] mx-10 bg-gray-50 min-h-screen ml-[200px] text-[#016E5B]">
                <button
                    type="button"
                    className="text-sm text-gray-500 hover:underline mb-4"
                    onClick={handleBack}
                >
                    Back
                </button>

                <div className="grid grid-cols-2 gap-6">
                    {/* Branch ID */}
                    <div>
                        <label htmlFor="locCode" className="block text-sm font-medium text-[#016E5B]">
                            Branch ID *
                        </label>
                        <input
                            id="locCode"
                            type="text"
                            placeholder="Enter Branch ID"
                            value={branchData.locCode}
                            onChange={handleChange}
                            className="bg-white border-gray-500 h-10 mt-1 block w-[300px] rounded-[5px] border shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Branch Manager */}
                    <div>
                        <label htmlFor="manager" className="block text-sm font-medium text-[#016E5B]">
                            Branch Manager *
                        </label>
                        <input
                            id="manager"
                            type="text"
                            value={branchData.manager}
                            onChange={handleChange}
                            placeholder="Enter Branch Manager"
                            className="bg-white border-gray-500 h-10 mt-1 block w-[300px] rounded-[5px] border shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Branch Name */}
                    <div>
                        <label htmlFor="workingBranch" className="block text-sm font-medium text-[#016E5B]">
                            Branch Name *
                        </label>
                        <input
                            id="workingBranch"
                            type="text"
                            value={branchData.workingBranch}
                            onChange={handleChange}
                            placeholder="Enter Branch Name"
                            className="bg-white border-gray-500 h-10 mt-1 block w-[300px] rounded-[5px] border shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-[#016E5B]">
                            Location
                        </label>
                        <input
                            id="location"
                            type="text"
                            value={branchData.location}
                            onChange={handleChange}
                            placeholder="Enter Location"
                            className="bg-white border-gray-500 h-10 mt-1 block w-[300px] rounded-[5px] border shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Address */}
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-[#016E5B]">
                            Address
                        </label>
                        <input
                            id="address"
                            type="text"
                            value={branchData.address}
                            onChange={handleChange}
                            placeholder="Enter Address"
                            className="bg-white border-gray-500 h-10 mt-1 block w-[300px] rounded-[5px] border shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-[#016E5B]">
                            Phone Number
                        </label>
                        <input
                            id="phoneNumber"
                            type="tel"
                            value={branchData.phoneNumber}
                            onChange={handleChange}
                            placeholder="Enter Phone Number"
                            className="bg-white border-gray-500 h-10 mt-1 block w-[300px] rounded-[5px] border shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            disabled={isSubmitting}
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="mt-6">
                    <button
                        type="button"
                        onClick={handleFormSubmit}
                        className="px-6 py-2 bg-[#016E5B] text-white rounded-lg hover:bg-[#014f42] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : 'Save Branch Details'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BranchForm;
