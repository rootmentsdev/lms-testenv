/**
 * Profile Data Component
 * 
 * Displays and allows editing of admin profile information
 * Supports viewing and updating admin details like name, email, and phone number
 * 
 * @returns {JSX.Element} - Profile data component
 */
import { useEffect, useState, useCallback } from "react";
import { toast } from 'react-toastify';
import { FaRegIdCard, FaRegSave } from "react-icons/fa";
import { CiMail } from "react-icons/ci";
import { IoPhonePortraitOutline } from "react-icons/io5";
import { HiOutlinePencil } from "react-icons/hi2";

import Header from "../../components/Header/Header";
import SideNav from "../../components/SideNav/SideNav";
import API_CONFIG from "../../api/api";

/**
 * API endpoints
 */
const API_ENDPOINTS = {
    GET_CURRENT_ADMIN: 'api/admin/get/current/admin',
    UPDATE_ADMIN_DETAILS: 'api/admin/update/admin/detaile',
};

/**
 * Default placeholder values
 */
const DEFAULT_PLACEHOLDERS = {
    EmpId: "(update EmpId number)",
    name: "(update name)",
    role: "(update role)",
    email: "(update email)",
    subRole: "(update subrole)",
    phoneNumber: "(update phone number)",
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
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

/**
 * Profile Data Component
 */
const ProfileData = () => {
    const token = getAuthToken();
    const [profileData, setProfileData] = useState({});
    const [editData, setEditData] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    /**
     * Normalizes profile data from API response
     * 
     * @param {Object} apiData - Data from API response
     * @returns {Object} - Normalized profile data
     */
    const normalizeProfileData = useCallback((apiData) => {
        return {
            EmpId: apiData.EmpId || DEFAULT_PLACEHOLDERS.EmpId,
            name: apiData.name || DEFAULT_PLACEHOLDERS.name,
            role: apiData.role || DEFAULT_PLACEHOLDERS.role,
            email: apiData.email || DEFAULT_PLACEHOLDERS.email,
            subRole: apiData.subRole || DEFAULT_PLACEHOLDERS.subRole,
            phoneNumber: apiData.phoneNumber || DEFAULT_PLACEHOLDERS.phoneNumber,
        };
    }, []);

    /**
     * Fetches current admin profile data
     */
    const fetchCurrentAdmin = useCallback(async () => {
        if (!token) return;

        setIsLoading(true);
        try {
            const response = await fetch(
                `${API_CONFIG.baseUrl}${API_ENDPOINTS.GET_CURRENT_ADMIN}`,
                {
                    method: "GET",
                    headers: buildAuthHeaders(),
                    credentials: "include",
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            const normalizedData = normalizeProfileData(result.data || {});
            
            setProfileData(normalizedData);
            setEditData(normalizedData);
        } catch (error) {
            console.error('Error fetching admin profile:', error);
            toast.error('Failed to load profile data');
        } finally {
            setIsLoading(false);
        }
    }, [token, normalizeProfileData]);

    /**
     * Updates admin profile data
     */
    const updateAdminData = useCallback(async () => {
        if (!token) return;

        setIsSaving(true);
        try {
            const response = await fetch(
                `${API_CONFIG.baseUrl}${API_ENDPOINTS.UPDATE_ADMIN_DETAILS}`,
                {
                    method: "POST",
                    headers: buildAuthHeaders(),
                    credentials: "include",
                    body: JSON.stringify(editData),
                }
            );

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            toast.success('Profile updated successfully!');
            await fetchCurrentAdmin();
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile data');
        } finally {
            setIsSaving(false);
        }
    }, [token, editData, fetchCurrentAdmin]);

    useEffect(() => {
        fetchCurrentAdmin();
    }, [fetchCurrentAdmin]);

    /**
     * Handles input field changes
     * 
     * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
     */
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setEditData((prev) => ({ ...prev, [name]: value }));
    }, []);

    /**
     * Handles modal open
     */
    const handleOpenModal = useCallback(() => {
        setEditData({ ...profileData });
        setIsModalOpen(true);
    }, [profileData]);

    /**
     * Handles modal close
     */
    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setEditData({ ...profileData });
    }, [profileData]);

    /**
     * Handles save action
     */
    const handleSave = useCallback(async () => {
        await updateAdminData();
        setIsModalOpen(false);
    }, [updateAdminData]);

    if (isLoading) {
        return (
            <div className="mb-[70px]">
                <Header name="Employee" />
                <SideNav />
                <div className="flex mt-[150px] ml-[150px] w-[1300px] bg-gray-100">
                    <div className="bg-white rounded-2xl w-full shadow-md p-6">
                        <div className="text-center py-8 text-gray-500">Loading profile...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-[70px]">
            <Header name="Employee" />
            <SideNav />

            <div className="flex mt-[150px] ml-[150px] w-[1300px] bg-gray-100">
                <div className="bg-white rounded-2xl w-full shadow-md p-6">
                    <div className="flex gap-10 items-start space-y-4 relative">
                        {/* Avatar Section */}
                        <div className="w-[150px]">
                            <div className="w-full h-32 bg-gradient-to-r from-blue-500 to-green-400 rounded-full flex justify-center items-center shadow-lg">
                                <span className="text-white text-3xl font-semibold">Admin</span>
                            </div>
                        </div>

                        {/* Profile Info Section */}
                        <div className="w-full">
                            <h2 className="text-xl font-bold text-gray-800">{profileData?.name}</h2>
                            <div className="flex gap-4">
                                <p className="text-sm text-gray-500">{profileData?.subRole}</p>
                                <p className="text-sm text-gray-500">{profileData?.role}</p>
                            </div>
                            
                            <div className="flex items-center space-x-3 mb-3">
                                <FaRegIdCard className="text-xl text-[#016E5B]" />
                                <p className="text-sm text-gray-700">{profileData?.EmpId}</p>
                            </div>
                            
                            <div className="flex items-center space-x-3 mb-3">
                                <CiMail className="text-xl text-[#016E5B]" />
                                <p className="text-sm text-gray-700">{profileData?.email}</p>
                            </div>
                            
                            <div className="flex items-center space-x-3 mb-3">
                                <IoPhonePortraitOutline className="text-xl text-[#016E5B]" />
                                <p className="text-sm text-gray-700">{profileData?.phoneNumber}</p>
                            </div>
                        </div>

                        {/* Edit Button */}
                        <div className="flex w-full justify-end absolute bottom-3">
                            <button
                                type="button"
                                className="px-4 py-2 text-sm font-medium text-[#016E5B] border-[#016E5B] border rounded-lg flex items-center gap-2 hover:bg-green-50 transition-colors"
                                onClick={handleOpenModal}
                            >
                                <HiOutlinePencil />
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
                        <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
                        
                        <div className="space-y-3">
                            <input
                                type="text"
                                name="name"
                                className="border bg-white w-full p-2 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                value={editData.name}
                                onChange={handleInputChange}
                                placeholder="Name"
                            />
                            <input
                                type="email"
                                name="email"
                                className="border bg-white w-full p-2 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                value={editData.email}
                                onChange={handleInputChange}
                                placeholder="Email"
                            />
                            <input
                                type="tel"
                                name="phoneNumber"
                                className="border bg-white w-full p-2 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                value={editData.phoneNumber}
                                onChange={handleInputChange}
                                placeholder="Phone Number"
                            />
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                type="button"
                                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                                onClick={handleCloseModal}
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="bg-green-500 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                <FaRegSave />
                                {isSaving ? 'Saving...' : 'Save Profile'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileData;
