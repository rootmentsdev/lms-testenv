import { useEffect, useState } from "react";
import { FaRegBell } from "react-icons/fa";
import baseUrl from "../../api/api";
import { Link } from "react-router-dom";

const Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch notifications from the backend
        const fetchNotifications = async () => {
            try {
                const response = await fetch(`${baseUrl.baseUrl}api/admin/home/notification`); // Adjust the endpoint URL
                const data = await response.json();
                console.log(data);
                console.log("hi" + notifications);

                if (response.ok) {
                    setNotifications(data.notifications); // Update the state with fetched notifications
                } else {
                    throw new Error(data.message || "Failed to fetch notifications");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false); // Stop the loading spinner
            }
        };

        fetchNotifications();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="bg-white w-[600px] shadow-lg border rounded-lg p-6 mr-[90px] mt-[50px]">
            <Link to={'/admin/Notification'}>
                <h2 className="text-lg font-semibold mb-4">Notifications</h2>
                <ul>
                    {notifications.map((notification) => (
                        <li
                            key={notification._id}
                            className="flex justify-between items-start border-b last:border-none pb-3 mb-3 last:pb-0 last:mb-0"
                        >
                            <div className="flex items-center">
                                <div className="bg-gray-100 p-2 rounded-full mr-3">
                                    <FaRegBell className="text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">{notification.title.length < 20 ? notification.title : notification.title.slice(0, 20)}</p>
                                    <p className="text-sm text-gray-600">{notification.body.length < 40 ? notification.body : notification.body.slice(0, 40) + "..."}</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-400 self-start">
                                {new Date(notification.createdAt).toLocaleString()}
                            </p>
                        </li>
                    ))}
                </ul>

            </Link>

        </div>
    );
};

export default Notification;
