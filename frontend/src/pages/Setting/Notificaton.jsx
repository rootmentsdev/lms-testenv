/**
 * Notification Settings Component
 * 
 * Manages notification preferences including general notifications,
 * notification preferences, and delivery methods
 * 
 * @returns {JSX.Element} - Notification settings component
 */
import { useState, useCallback } from "react";

/**
 * Initial notification settings state
 */
const INITIAL_SETTINGS = {
    enableNotifications: {
        general: true,
        assessment: false,
    },
    notificationPreferences: {
        trainingAlerts: false,
        deadlineReminders: true,
    },
    notificationMethods: {
        email: true,
        inApp: true,
        sms: false,
    },
};

/**
 * Notification method labels
 */
const NOTIFICATION_METHODS = [
    { method: "Email Notifications", key: "email" },
    { method: "In-App Notifications", key: "inApp" },
    { method: "WhatsApp", key: "sms" },
];

/**
 * Notification Settings Component
 */
const NotificationSettings = () => {
    const [settings, setSettings] = useState(INITIAL_SETTINGS);

    /**
     * Toggles a specific setting
     * 
     * @param {string} category - Settings category (enableNotifications, notificationPreferences, notificationMethods)
     * @param {string} key - Setting key to toggle
     */
    const toggleSetting = useCallback((category, key) => {
        setSettings((prev) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: !prev[category][key],
            },
        }));
    }, []);

    /**
     * Handles form submission
     */
    const handleSubmit = useCallback(() => {
        console.log("Notification Settings (JSON):", JSON.stringify(settings, null, 2));
        // TODO: Add API call to save settings
    }, [settings]);

    /**
     * Renders a toggle switch
     * 
     * @param {boolean} isActive - Whether the toggle is active
     * @param {Function} onClick - Click handler
     * @returns {JSX.Element} - Toggle switch element
     */
    const renderToggle = (isActive, onClick) => (
        <button
            type="button"
            className={`w-10 h-6 flex items-center rounded-full transition-colors ${
                isActive ? "bg-green-600" : "bg-gray-300"
            }`}
            onClick={onClick}
            aria-label={isActive ? "Enabled" : "Disabled"}
        >
            <div
                className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
                    isActive ? "translate-x-4" : "translate-x-0"
                }`}
            />
        </button>
    );

    /**
     * Renders a notification option
     * 
     * @param {Object} props - Component props
     * @param {string} props.title - Option title
     * @param {string} props.description - Option description
     * @param {boolean} props.isActive - Whether option is active
     * @param {Function} props.onToggle - Toggle handler
     * @returns {JSX.Element} - Notification option element
     */
    const NotificationOption = ({ title, description, isActive, onToggle }) => (
        <div className="flex items-center justify-between">
            <div>
                <h3 className="text-md font-semibold">{title}</h3>
                <p className="text-sm text-gray-600">{description}</p>
            </div>
            {renderToggle(isActive, onToggle)}
        </div>
    );

    return (
        <div className="p-6 bg-gray-50 text-black min-h-screen">
            <h1 className="text-2xl font-bold mb-6">Notification Settings</h1>
            
            <div className="bg-white p-6 rounded-lg shadow space-y-6">
                {/* Enable Notifications Section */}
                <div>
                    <h2 className="text-lg font-bold mb-4 text-green-600">General Notifications</h2>
                    <div className="space-y-4">
                        <NotificationOption
                            title="Training Notifications"
                            description="Enable or disable all notifications related to training"
                            isActive={settings.enableNotifications.general}
                            onToggle={() => toggleSetting("enableNotifications", "general")}
                        />
                        <NotificationOption
                            title="Assessment Notifications"
                            description="Enable or disable notifications for upcoming assessments"
                            isActive={settings.enableNotifications.assessment}
                            onToggle={() => toggleSetting("enableNotifications", "assessment")}
                        />
                    </div>
                </div>

                {/* Notification Preferences Section */}
                <div>
                    <h2 className="text-lg font-bold mb-4 text-green-600">
                        Due Date Notification Reminder
                    </h2>
                    <div className="space-y-4">
                        <NotificationOption
                            title="Training Alerts"
                            description="Alerts for Due Training deadlines"
                            isActive={settings.notificationPreferences.trainingAlerts}
                            onToggle={() => toggleSetting("notificationPreferences", "trainingAlerts")}
                        />
                        <NotificationOption
                            title="Assignment Alerts"
                            description="Alerts for Due Assessment deadlines"
                            isActive={settings.notificationPreferences.deadlineReminders}
                            onToggle={() => toggleSetting("notificationPreferences", "deadlineReminders")}
                        />
                    </div>
                </div>

                {/* Notification Methods Section */}
                <div>
                    <h2 className="text-lg font-bold mb-4 text-green-600">Notification Methods</h2>
                    <div className="space-y-4">
                        {NOTIFICATION_METHODS.map(({ method, key }) => (
                            <NotificationOption
                                key={key}
                                title={method}
                                description=""
                                isActive={settings.notificationMethods[key]}
                                onToggle={() => toggleSetting("notificationMethods", key)}
                            />
                        ))}
                    </div>
                    <button
                        type="button"
                        className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        onClick={handleSubmit}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettings;
