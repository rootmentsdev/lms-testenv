/**
 * Notification Data Component
 * 
 * Displays a list of all notifications with timestamps
 * Fetches notifications from API and renders them in a list format
 * 
 * @returns {JSX.Element} - Notification data component
 */
import { useEffect, useState, useCallback } from "react";

import Header from "../../components/Header/Header";
import SideNav from "../../components/SideNav/SideNav";
import API_CONFIG from "../../api/api";

/**
 * API endpoint for notifications
 */
const NOTIFICATIONS_ENDPOINT = 'api/admin/home/AllNotification';

/**
 * Formats date to localized string
 * 
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} - Formatted date string
 */
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
        return new Date(dateString).toLocaleString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
    }
};

/**
 * Notification Data Component
 */
const NotificationData = () => {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Fetches notifications from API
     */
    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${NOTIFICATIONS_ENDPOINT}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (response.ok) {
                setNotifications(data.notifications || []);
            } else {
                throw new Error(data.message || "Failed to fetch notifications");
            }
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError(err.message || 'Failed to load notifications');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    if (isLoading) {
        return (
            <div className="mx-0 mb-[90px]">
                <Header name="Notification" />
                <div className="flex md:ml-[160px] ml-0">
                    <SideNav />
                    <div className="flex justify-center items-center min-h-screen mt-28">
                        <div className="text-gray-500">Loading notifications...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-0 mb-[90px]">
                <Header name="Notification" />
                <div className="flex md:ml-[160px] ml-0">
                    <SideNav />
                    <div className="flex justify-center items-center min-h-screen mt-28">
                        <div className="text-red-500">{error}</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-0 mb-[90px]">
            <Header name="Notification" />
            
            <div className="flex md:ml-[160px] ml-0">
                <SideNav />
                
                <div className="flex justify-center items-center min-h-screen mt-28">
                    <div className="bg-white w-full shadow-lg rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4 text-black">Notifications</h2>
                        
                        {notifications.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No notifications available.
                            </div>
                        ) : (
                            <ul className="space-y-4">
                                {notifications.map((notification, index) => (
                                    <li
                                        key={notification._id || index}
                                        className="p-4 border rounded-md bg-white hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-800 mb-1">
                                                    {notification.title || 'Untitled Notification'}
                                                </p>
                                                {notification.body && (
                                                    <p className="text-sm text-gray-600">
                                                        {notification.body}
                                                    </p>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-400 ml-4 whitespace-nowrap">
                                                {formatDate(notification.createdAt)}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationData;
