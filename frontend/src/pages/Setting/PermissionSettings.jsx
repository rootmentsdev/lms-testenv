/**
 * Permission Settings Component
 * 
 * Manages role-based permissions for training and assessment operations
 * Supports create, reassign, and delete permissions for different roles
 * 
 * @returns {JSX.Element} - Permission settings component
 */
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";

import API_CONFIG from "../../api/api";

/**
 * API endpoints
 */
const API_ENDPOINTS = {
    GET_PERMISSIONS: 'api/admin/get/permission/controller',
    SAVE_PERMISSIONS: 'api/admin/permission/controller',
};

/**
 * Role keys mapping
 */
const ROLES = {
    ADMIN: 'admin',
    CLUSTER_MANAGER: 'clusterManager',
    STORE_MANAGER: 'storeManager',
};

/**
 * Permission categories
 */
const PERMISSION_CATEGORIES = {
    TRAINING: 'training',
    ASSESSMENT: 'assessment',
};

/**
 * Permission actions configuration
 */
const PERMISSION_ACTIONS = {
    [PERMISSION_CATEGORIES.TRAINING]: [
        "Create Training",
        "Assign Training",
        "Delete Training",
    ],
    [PERMISSION_CATEGORIES.ASSESSMENT]: [
        "Create Assessment",
        "Assign Assessment",
        "Delete Assessment",
    ],
};

/**
 * Default permissions structure
 */
const DEFAULT_PERMISSIONS = {
    [ROLES.ADMIN]: {
        [PERMISSION_CATEGORIES.TRAINING]: [false, false, false],
        [PERMISSION_CATEGORIES.ASSESSMENT]: [false, false, false],
    },
    [ROLES.CLUSTER_MANAGER]: {
        [PERMISSION_CATEGORIES.TRAINING]: [false, false, false],
        [PERMISSION_CATEGORIES.ASSESSMENT]: [false, false, false],
    },
    [ROLES.STORE_MANAGER]: {
        [PERMISSION_CATEGORIES.TRAINING]: [false, false, false],
        [PERMISSION_CATEGORIES.ASSESSMENT]: [false, false, false],
    },
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
 * Permission Settings Component
 */
const PermissionSettings = () => {
    const token = getAuthToken();
    const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    /**
     * Toggles a specific permission
     * 
     * @param {string} role - Role key
     * @param {string} category - Permission category
     * @param {number} index - Permission index
     */
    const togglePermission = useCallback((role, category, index) => {
        setPermissions((prev) => ({
            ...prev,
            [role]: {
                ...prev[role],
                [category]: prev[role][category].map((val, idx) => 
                    idx === index ? !val : val
                ),
            },
        }));
    }, []);

    /**
     * Fetches permissions from API
     */
    const fetchPermissions = useCallback(async () => {
        if (!token) return;

        setIsLoading(true);
        try {
            const response = await fetch(
                `${API_CONFIG.baseUrl}${API_ENDPOINTS.GET_PERMISSIONS}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    credentials: "include",
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch permissions");
            }

            const result = await response.json();

            if (!result.data || result.data.length < 3) {
                throw new Error("Invalid permission data received");
            }

            setPermissions({
                [ROLES.ADMIN]: {
                    [PERMISSION_CATEGORIES.TRAINING]: [
                        result.data[0]?.permissions.canCreateTraining || false,
                        result.data[0]?.permissions.canReassignTraining || false,
                        result.data[0]?.permissions.canDeleteTraining || false,
                    ],
                    [PERMISSION_CATEGORIES.ASSESSMENT]: [
                        result.data[0]?.permissions.canCreateAssessment || false,
                        result.data[0]?.permissions.canReassignAssessment || false,
                        result.data[0]?.permissions.canDeleteAssessment || false,
                    ],
                },
                [ROLES.CLUSTER_MANAGER]: {
                    [PERMISSION_CATEGORIES.TRAINING]: [
                        result.data[1]?.permissions.canCreateTraining || false,
                        result.data[1]?.permissions.canReassignTraining || false,
                        result.data[1]?.permissions.canDeleteTraining || false,
                    ],
                    [PERMISSION_CATEGORIES.ASSESSMENT]: [
                        result.data[1]?.permissions.canCreateAssessment || false,
                        result.data[1]?.permissions.canReassignAssessment || false,
                        result.data[1]?.permissions.canDeleteAssessment || false,
                    ],
                },
                [ROLES.STORE_MANAGER]: {
                    [PERMISSION_CATEGORIES.TRAINING]: [
                        result.data[2]?.permissions.canCreateTraining || false,
                        result.data[2]?.permissions.canReassignTraining || false,
                        result.data[2]?.permissions.canDeleteTraining || false,
                    ],
                    [PERMISSION_CATEGORIES.ASSESSMENT]: [
                        result.data[2]?.permissions.canCreateAssessment || false,
                        result.data[2]?.permissions.canReassignAssessment || false,
                        result.data[2]?.permissions.canDeleteAssessment || false,
                    ],
                },
            });
        } catch (error) {
            console.error("Error fetching permissions:", error);
            toast.error("Failed to load permissions");
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    /**
     * Saves permissions to API
     */
    const handleSaveChanges = useCallback(async () => {
        if (!token) return;

        setIsSaving(true);
        try {
            const formattedPermissions = Object.keys(permissions).reduce((acc, role) => {
                acc[role] = {
                    [PERMISSION_CATEGORIES.TRAINING]: permissions[role][PERMISSION_CATEGORIES.TRAINING],
                    [PERMISSION_CATEGORIES.ASSESSMENT]: permissions[role][PERMISSION_CATEGORIES.ASSESSMENT],
                };
                return acc;
            }, {});

            const response = await fetch(`${API_CONFIG.baseUrl}${API_ENDPOINTS.SAVE_PERMISSIONS}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
                body: JSON.stringify(formattedPermissions),
            });

            if (!response.ok) {
                throw new Error("Failed to save permissions");
            }

            toast.success("Permissions successfully updated!");
        } catch (error) {
            console.error("Error saving permissions:", error);
            toast.error("Failed to save permissions");
        } finally {
            setIsSaving(false);
        }
    }, [permissions, token]);

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    if (isLoading) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen w-full text-black">
                <div className="text-lg">Loading permissions...</div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen w-full text-black">
            <h1 className="text-2xl font-bold mb-6">Permission Settings</h1>
            
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-bold mb-4">Role-Based Permissions</h2>
                
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border-none border-gray-300">
                        <thead>
                            <tr>
                                <th className="border border-gray-300 p-2">Action</th>
                                <th className="border border-gray-300 p-2">Admin</th>
                                <th className="border border-gray-300 p-2">Cluster Manager</th>
                                <th className="border border-gray-300 p-2">Store Manager</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(PERMISSION_ACTIONS).map(([category, actions]) => (
                                <React.Fragment key={category}>
                                    {actions.map((action, idx) => (
                                        <tr key={action}>
                                            <td className="border border-gray-300 p-2">{action}</td>
                                            {Object.values(ROLES).map((role) => (
                                                <td key={role} className="border border-gray-300 text-center p-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={permissions[role]?.[category]?.[idx] || false}
                                                        onChange={() => togglePermission(role, category, idx)}
                                                        disabled={isSaving}
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <button
                    type="button"
                    className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};

export default PermissionSettings;
