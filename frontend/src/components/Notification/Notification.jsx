/**
 * Notification Component
 * 
 * Displays list of recent notifications from the dashboard
 * Shows notification title, body, and creation date
 * Links to full notifications page
 * 
 * @returns {JSX.Element} - Notification list component or loading/error state
 */
import { Link } from "react-router-dom";
import { FaRegBell } from "react-icons/fa";
import { useGetNotificationsQuery } from "../../features/dashboard/dashboardApi";

/**
 * Route path constants
 */
const ROUTE_PATHS = {
    NOTIFICATIONS: '/admin/Notification',
};

/**
 * Text truncation limits
 */
const TEXT_LIMITS = {
    TITLE: 20,
    BODY: 40,
};

/**
 * Truncates text to specified length
 * 
 * @param {string} text - Text to truncate
 * @param {number} limit - Maximum length
 * @returns {string} - Truncated text
 */
const truncateText = (text, limit) => {
    if (!text || text.length <= limit) return text;
    return text.slice(0, limit);
};

/**
 * Formats date to localized string
 * 
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date string
 */
const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
        return new Date(dateString).toLocaleString();
    } catch (error) {
        console.error('Failed to format date:', error);
        return '';
    }
};

/**
 * Loading skeleton component
 */
const LoadingSkeleton = () => (
    <div
        role="status"
        className="flex items-center justify-center h-[250px] w-[600px] shadow-xl bg-slate-100 rounded-lg animate-pulse"
        aria-label="Loading notifications"
    >
        <span className="sr-only">Loading...</span>
    </div>
);

/**
 * Error state component
 * 
 * @param {string} errorMessage - Error message to display
 */
const ErrorState = ({ errorMessage }) => (
    <div className="text-red-500 p-4 bg-red-50 rounded-lg">
        {errorMessage}
    </div>
);

/**
 * Empty state component
 */
const EmptyState = () => (
    <div className="bg-white w-[600px] shadow-lg border rounded-lg p-6 mr-[90px] mt-[50px]">
        <h2 className="text-lg font-semibold mb-4">Notifications</h2>
        <p className="text-gray-500 text-center py-8">No notifications available</p>
    </div>
);

/**
 * Notification Component
 */
const Notification = () => {
    const { data: responseData, isLoading, isError } = useGetNotificationsQuery();
    const notifications = responseData?.notifications || [];

    // Loading state
    if (isLoading) {
        return <LoadingSkeleton />;
    }

    // Error state
    if (isError) {
        return <ErrorState errorMessage="Failed to fetch notifications" />;
    }

    // Empty state
    if (notifications.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="bg-white w-[600px] shadow-lg border rounded-lg p-6 mr-[90px] mt-[50px]">
            <Link to={ROUTE_PATHS.NOTIFICATIONS}>
                <h2 className="text-lg font-semibold mb-4">Notifications</h2>
                <ul>
                    {notifications.map((notification) => (
                        <li
                            key={notification._id}
                            className="flex justify-between items-start border-b last:border-none pb-3 mb-3 last:pb-0 last:mb-0"
                        >
                            <div className="flex items-center">
                                <div className="bg-gray-100 p-2 rounded-full mr-3">
                                    <FaRegBell className="text-green-600" aria-hidden="true" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">
                                        {truncateText(notification.title, TEXT_LIMITS.TITLE)}
                                    </p>
                                    {notification.body && notification.body.length > 0 && (
                                        <p className="text-sm text-gray-600">
                                            {truncateText(notification.body, TEXT_LIMITS.BODY)}
                                            {notification.body.length > TEXT_LIMITS.BODY && '...'}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <p className="text-sm text-gray-400 self-start">
                                {formatDate(notification.createdAt)}
                            </p>
                        </li>
                    ))}
                </ul>
            </Link>
        </div>
    );
};

export default Notification;
