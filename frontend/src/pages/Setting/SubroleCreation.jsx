/**
 * Subrole Creation Component
 * 
 * Handles creation of new subroles with level configuration
 * 
 * @returns {JSX.Element} - Subrole creation component
 */
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

import API_CONFIG from '../../api/api';

/**
 * API endpoint for subrole creation
 */
const SUBROLE_ENDPOINT = 'api/admin/subroles';

/**
 * Available level options
 */
const LEVEL_OPTIONS = ['Level 1', 'Level 2', 'Level 3'];

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
 * Subrole Creation Component
 */
const SubroleCreation = () => {
    const [formData, setFormData] = useState({
        subrole: '',
        roleCode: '',
        level: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * Handles form field changes
     * 
     * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} e - Input change event
     */
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
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
            const response = await fetch(`${API_CONFIG.baseUrl}${SUBROLE_ENDPOINT}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error: ${response.status} - ${response.statusText}. ${errorText}`);
            }

            const data = await response.json();
            console.log('Server Response:', data);
            toast.success('Subrole created successfully!');
            
            // Reset form after successful creation
            setFormData({
                subrole: '',
                roleCode: '',
                level: '',
            });
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error(`Failed to create subrole: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    }, [formData]);

    return (
        <div className="flex justify-center text-black items-center h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-center">Create Subrole</h2>
                
                <form onSubmit={handleSubmit}>
                    {/* Subrole Field */}
                    <div className="mb-4">
                        <label htmlFor="subrole" className="block text-gray-700 font-medium mb-2">
                            Subrole
                        </label>
                        <input
                            type="text"
                            id="subrole"
                            name="subrole"
                            value={formData.subrole}
                            onChange={handleChange}
                            className="w-full bg-white border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#016E5B]"
                            placeholder="Enter subrole"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Role Code Field */}
                    <div className="mb-4">
                        <label htmlFor="roleCode" className="block text-gray-700 font-medium mb-2">
                            Role Code
                        </label>
                        <input
                            type="text"
                            id="roleCode"
                            name="roleCode"
                            value={formData.roleCode}
                            onChange={handleChange}
                            className="w-full border bg-white border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#016E5B]"
                            placeholder="Enter role code"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Level Dropdown */}
                    <div className="mb-4">
                        <label htmlFor="level" className="block text-gray-700 font-medium mb-2">
                            Level
                        </label>
                        <select
                            id="level"
                            name="level"
                            value={formData.level}
                            onChange={handleChange}
                            className="w-full border bg-white border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#016E5B]"
                            required
                            disabled={isSubmitting}
                        >
                            <option value="">Select level</option>
                            {LEVEL_OPTIONS.map((level) => (
                                <option key={level} value={level}>
                                    {level}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-[#016E5B] text-white font-medium py-2 px-4 rounded-lg hover:bg-[#256d62] focus:outline-none focus:ring-2 focus:ring-[#1a544b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SubroleCreation;
