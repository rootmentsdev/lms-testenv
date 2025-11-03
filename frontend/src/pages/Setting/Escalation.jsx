/**
 * Escalation Levels Component
 * 
 * Manages escalation level configuration with editable number of days
 * Supports fetching and saving escalation level data
 * 
 * @returns {JSX.Element} - Escalation levels component
 */
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";

import API_CONFIG from "../../api/api";

/**
 * API endpoints
 */
const API_ENDPOINTS = {
    GET_ESCALATION: 'api/admin/escalation/level/get',
    SAVE_ESCALATION: 'api/admin/escalation/level',
};

/**
 * Contexts that should not be editable
 */
const NON_EDITABLE_CONTEXTS = [
    "On-the-day deadline alert",
    "Recurring escalation every two days after the 5-day mark",
];

/**
 * Checks if a row is editable based on its context
 * 
 * @param {string} context - Row context
 * @returns {boolean} - True if row is editable
 */
const isRowEditable = (context) => {
    return !NON_EDITABLE_CONTEXTS.includes(context);
};

/**
 * Escalation Levels Component
 */
const Escalation = () => {
    const [tableData, setTableData] = useState([]);
    const [editRowId, setEditRowId] = useState(null);
    const [updatedValue, setUpdatedValue] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    /**
     * Starts editing a specific row
     * 
     * @param {number} id - Row ID
     * @param {string|number} currentValue - Current value to edit
     */
    const handleEdit = useCallback((id, currentValue) => {
        setEditRowId(id);
        setUpdatedValue(String(currentValue));
    }, []);

    /**
     * Cancels editing
     */
    const handleCancelEdit = useCallback(() => {
        setEditRowId(null);
        setUpdatedValue("");
    }, []);

    /**
     * Saves the updated value for a specific row
     * 
     * @param {number} id - Row ID
     */
    const handleSave = useCallback((id) => {
        const updatedData = tableData.map((row) => {
            if (row.id === id) {
                return { ...row, numberOfDays: updatedValue };
            }
            return row;
        });
        setTableData(updatedData);
        handleCancelEdit();
    }, [tableData, updatedValue, handleCancelEdit]);

    /**
     * Fetches escalation levels from API
     */
    const fetchEscalationData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_ENDPOINTS.GET_ESCALATION}`);
            
            if (!response.ok) {
                throw new Error("Failed to fetch escalation levels");
            }

            const data = await response.json();
            const sortedData = (data.data || []).sort((a, b) => a.id - b.id);
            setTableData(sortedData);
        } catch (error) {
            console.error("Error fetching escalation levels:", error.message);
            toast.error("Failed to load data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Saves escalation levels to API
     */
    const handleFormSave = useCallback(async () => {
        setIsSaving(true);
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_ENDPOINTS.SAVE_ESCALATION}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tableData }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to save data");
            }

            const data = await response.json();
            console.log("Data successfully saved:", data);
            toast.success("Escalation levels saved successfully!");
        } catch (error) {
            console.error("Error saving escalation levels:", error.message);
            toast.error(`Failed to save data: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    }, [tableData]);

    useEffect(() => {
        fetchEscalationData();
    }, [fetchEscalationData]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
                <div className="text-lg">Loading escalation levels...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="w-full max-w-4xl bg-white shadow-md rounded-lg p-6">
                <h1 className="text-xl font-bold text-gray-800 mb-4">Escalation Levels</h1>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 border-b border-gray-200 text-left text-sm font-medium text-gray-600">
                                    Level
                                </th>
                                <th className="px-4 py-2 border-b border-gray-200 text-left text-sm font-medium text-gray-600">
                                    Context
                                </th>
                                <th className="px-4 py-2 border-b border-gray-200 text-left text-sm font-medium text-gray-600">
                                    Number of Days
                                </th>
                                <th className="px-4 py-2 border-b border-gray-200 text-left text-sm font-medium text-gray-600">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map((row) => (
                                <tr 
                                    key={row.id} 
                                    className={row.id % 2 === 0 ? "bg-gray-50" : "bg-white"}
                                >
                                    <td className="px-4 py-2 border-b border-gray-200 text-sm text-gray-800">
                                        {row.level}
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200 text-sm text-gray-800">
                                        {row.context}
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200 text-sm text-gray-800 relative">
                                        {editRowId === row.id ? (
                                            <input
                                                type="number"
                                                value={updatedValue}
                                                onChange={(e) => setUpdatedValue(e.target.value)}
                                                className="px-2 py-1 border rounded bg-white w-[100px]"
                                                min="0"
                                                autoFocus
                                            />
                                        ) : (
                                            row.numberOfDays
                                        )}
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200 text-sm text-gray-800">
                                        {isRowEditable(row.context) ? (
                                            editRowId === row.id ? (
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                                        onClick={() => handleSave(row.id)}
                                                    >
                                                        Done
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="px-4 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                                                        onClick={handleCancelEdit}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                                    onClick={() => handleEdit(row.id, row.numberOfDays)}
                                                >
                                                    Edit
                                                </button>
                                            )
                                        ) : (
                                            <span className="text-gray-400 italic">Not Editable</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <button
                    type="button"
                    className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    onClick={handleFormSave}
                    disabled={isSaving}
                >
                    {isSaving ? 'Saving...' : 'Save Form'}
                </button>
            </div>
        </div>
    );
};

export default Escalation;
