/**
 * Visibility Settings Component
 * 
 * Manages visibility settings for assessment and training modules
 * Supports role-based visibility toggles
 * 
 * @returns {JSX.Element} - Visibility settings component
 */
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";

import API_CONFIG from "../../api/api";

/**
 * API endpoints
 */
const API_ENDPOINTS = {
    GET_VISIBILITY: 'api/admin/get/setting/visibility',
    SAVE_VISIBILITY: 'api/admin/setting/visibility',
};

/**
 * Visibility sections
 */
const VISIBILITY_SECTIONS = {
    ASSESSMENT: 'Assessment',
    TRAINING: 'training',
};

/**
 * Visibility Settings Component
 */
const Visibility = () => {
    const [visibilityData, setVisibilityData] = useState({});
    const [expanded, setExpanded] = useState({
        [VISIBILITY_SECTIONS.ASSESSMENT]: false,
        [VISIBILITY_SECTIONS.TRAINING]: false,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    /**
     * Toggles section expansion
     * 
     * @param {string} section - Section to toggle
     */
    const toggleSection = useCallback((section) => {
        setExpanded((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    }, []);

    /**
     * Toggles visibility for a specific role
     * 
     * @param {string} section - Section name
     * @param {string} role - Role name
     */
    const toggleVisibility = useCallback((section, role) => {
        setVisibilityData((prev) => ({
            ...prev,
            [section]: (prev[section] || []).map((item) =>
                item.role === role
                    ? { ...item, visibility: !item.visibility }
                    : item
            ),
        }));
    }, []);

    /**
     * Fetches visibility data from API
     */
    const fetchVisibilityData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_ENDPOINTS.GET_VISIBILITY}`);
            
            if (!response.ok) {
                throw new Error("Failed to fetch visibility settings");
            }

            const result = await response.json();
            setVisibilityData(result.Data?.[0] || {});
        } catch (error) {
            console.error("Error fetching visibility data:", error);
            toast.error("Failed to load visibility settings");
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Saves visibility settings to API
     */
    const handleSaveChanges = useCallback(async () => {
        setIsSaving(true);
        try {
            // Transform visibilityData into the required format
            const training = Object.entries(visibilityData).map(([section, roles]) => ({
                section,
                role: Array.isArray(roles)
                    ? roles.map((item) => ({
                        role: item.role.toLowerCase().replace(/\s+/g, "_"),
                        visibility: item.visibility,
                    }))
                    : [],
            }));

            const response = await fetch(`${API_CONFIG.baseUrl}${API_ENDPOINTS.SAVE_VISIBILITY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(training),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to save changes");
            }

            const result = await response.json();
            console.log("Response from backend:", result);
            toast.success("Visibility settings updated successfully!");
        } catch (error) {
            console.error("Error saving changes:", error.message);
            toast.error(`An error occurred while saving changes: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    }, [visibilityData]);

    useEffect(() => {
        fetchVisibilityData();
    }, [fetchVisibilityData]);

    if (isLoading) {
        return (
            <div className="p-6 min-h-screen text-black">
                <div className="text-lg">Loading visibility settings...</div>
            </div>
        );
    }

    /**
     * Renders a visibility table for a section
     * 
     * @param {string} sectionKey - Section key
     * @param {string} sectionTitle - Section title
     * @returns {JSX.Element} - Visibility table element
     */
    const renderVisibilityTable = (sectionKey, sectionTitle) => {
        const sectionData = visibilityData[sectionKey] || [];

        return (
            <div>
                <h3
                    className="text-md font-semibold mb-2 cursor-pointer flex justify-between items-center hover:text-green-600 transition-colors"
                    onClick={() => toggleSection(sectionKey)}
                >
                    {sectionTitle}
                    <span>{expanded[sectionKey] ? "▲" : "▼"}</span>
                </h3>
                {expanded[sectionKey] && (
                    <table className="w-full border-collapse border border-gray-300 text-left">
                        <thead>
                            <tr>
                                <th className="border border-gray-300 p-2">Role</th>
                                <th className="border border-gray-300 p-2">Visibility</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sectionData.map((item) => (
                                <tr key={item.role}>
                                    <td className="border border-gray-300 p-2">{item.role}</td>
                                    <td className="border border-gray-300 p-2 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <span>{item.visibility ? "Visible" : <del>Visible</del>}</span>
                                            <input
                                                type="checkbox"
                                                className="toggle toggle-success"
                                                checked={item.visibility}
                                                onChange={() => toggleVisibility(sectionKey, item.role)}
                                                disabled={isSaving}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        );
    };

    return (
        <div className="p-6 min-h-screen text-black">
            <h1 className="text-2xl font-bold mb-6">Visibility Settings</h1>
            
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-bold mb-4">Content Access</h2>
                <div className="space-y-6">
                    {renderVisibilityTable(VISIBILITY_SECTIONS.ASSESSMENT, "Assessment Module Visibility")}
                    {renderVisibilityTable(VISIBILITY_SECTIONS.TRAINING, "Training Progress Visibility")}
                    
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
        </div>
    );
};

export default Visibility;
