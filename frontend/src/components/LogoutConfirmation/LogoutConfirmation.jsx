/**
 * Logout Confirmation Modal Component
 * 
 * Displays a confirmation dialog before user logs out
 * Provides cancel and confirm actions
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Callback function when modal is closed
 * @param {Function} props.onConfirm - Callback function when logout is confirmed
 * @returns {JSX.Element|null} - Modal component or null if not open
 */
import React from 'react';
import { IoIosLogOut } from "react-icons/io";
import { IoClose } from "react-icons/io5";

/**
 * Logout confirmation message
 */
const LOGOUT_MESSAGE = "Are you sure you want to log out? You will need to sign in again to access your account.";

const LogoutConfirmation = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) {
        return null;
    }

    /**
     * Handles logout confirmation
     * Calls both onConfirm and onClose to ensure modal closes after action
     */
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="bg-red-100 p-2 rounded-full">
                            <IoIosLogOut className="text-red-600 text-xl" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Confirm Logout</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close modal"
                    >
                        <IoClose className="text-xl" />
                    </button>
                </div>

                {/* Content */}
                <div className="mb-6">
                    <p className="text-gray-600">
                        {LOGOUT_MESSAGE}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center space-x-2"
                    >
                        <IoIosLogOut className="text-sm" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogoutConfirmation;
