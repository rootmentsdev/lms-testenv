import { useState } from "react";

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
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
  });

  const toggleSetting = (category, key) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key],
      },
    }));
  };

  return (
    <div className="p-6 bg-gray-50 text-black min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Notification Settings</h1>
      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        {/* Enable Notifications */}
        <div>
          <h2 className="text-lg font-bold mb-4 text-green-600">
            Enable Notifications
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-md font-semibold">General Notifications</h3>
                <p className="text-sm text-gray-600">
                  Enable or disable all notifications related to training,
                  assessments, and deadlines.
                </p>
              </div>
              <button
                className={`w-10 h-6 flex items-center rounded-full ${settings.enableNotifications.general
                  ? "bg-green-600"
                  : "bg-gray-300"
                  }`}
                onClick={() =>
                  toggleSetting("enableNotifications", "general")
                }
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow-md transform ${settings.enableNotifications.general
                    ? "translate-x-4"
                    : "translate-x-0"
                    }`}
                ></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-md font-semibold">
                  Assessment Notifications
                </h3>
                <p className="text-sm text-gray-600">
                  Enable or disable notifications for upcoming assessments,
                  deadlines, and results.
                </p>
              </div>
              <button
                className={`w-10 h-6 flex items-center rounded-full ${settings.enableNotifications.assessment
                  ? "bg-green-600"
                  : "bg-gray-300"
                  }`}
                onClick={() =>
                  toggleSetting("enableNotifications", "assessment")
                }
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow-md transform ${settings.enableNotifications.assessment
                    ? "translate-x-4"
                    : "translate-x-0"
                    }`}
                ></div>
              </button>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div>
          <h2 className="text-lg font-bold mb-4 text-green-600">
            Notification Preferences
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-md font-semibold">
                  Training Assignment Alerts
                </h3>
                <p className="text-sm text-gray-600">
                  Receive notifications when new training is assigned to you or
                  when an update occurs in your assigned training.
                </p>
              </div>
              <button
                className={`w-10 h-6 flex items-center rounded-full ${settings.notificationPreferences.trainingAlerts
                  ? "bg-green-600"
                  : "bg-gray-300"
                  }`}
                onClick={() =>
                  toggleSetting("notificationPreferences", "trainingAlerts")
                }
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow-md transform ${settings.notificationPreferences.trainingAlerts
                    ? "translate-x-4"
                    : "translate-x-0"
                    }`}
                ></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-md font-semibold">Deadline Reminders</h3>
                <p className="text-sm text-gray-600">
                  Receive notifications when deadlines are approaching for
                  training or assessments (e.g., 24 hours, 1 hour before).
                </p>
              </div>
              <button
                className={`w-10 h-6 flex items-center rounded-full ${settings.notificationPreferences.deadlineReminders
                  ? "bg-green-600"
                  : "bg-gray-300"
                  }`}
                onClick={() =>
                  toggleSetting("notificationPreferences", "deadlineReminders")
                }
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow-md transform ${settings.notificationPreferences.deadlineReminders
                    ? "translate-x-4"
                    : "translate-x-0"
                    }`}
                ></div>
              </button>
            </div>
          </div>
        </div>

        {/* Notification Methods */}
        <div>
          <h2 className="text-lg font-bold mb-4 text-green-600">
            Notification Methods
          </h2>
          <div className="space-y-4">
            {[
              { method: "Email Notifications", key: "email" },
              { method: "In-App Notifications", key: "inApp" },
              { method: "SMS Notifications", key: "sms" },
            ].map(({ method, key }) => (
              <div
                key={key}
                className="flex items-center justify-between"
              >
                <div>
                  <h3 className="text-md font-semibold">{method}</h3>
                </div>
                <button
                  className={`w-10 h-6 flex items-center rounded-full ${settings.notificationMethods[key]
                    ? "bg-green-600"
                    : "bg-gray-300"
                    }`}
                  onClick={() =>
                    toggleSetting("notificationMethods", key)
                  }
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-md transform ${settings.notificationMethods[key]
                      ? "translate-x-4"
                      : "translate-x-0"
                      }`}
                  ></div>
                </button>
              </div>
            ))}
          </div>
          <button className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
