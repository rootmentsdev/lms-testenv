/**
 * Notifications Page Component
 * 
 * Wrapper component for notifications management page
 * Handles mobile navigation display
 * 
 * @returns {JSX.Element} - Notifications page component
 */
import ModileNav from "../../components/SideNav/ModileNav";
import NotificationData from "./NotificationData";

/**
 * Component styling constants
 */
const CONTAINER_STYLES = {
    container: {
        display: "flex",
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "white",
        overflowX: "hidden",
    },
    middle: {
        flex: 1,
        width: "100%",
        minHeight: "100vh",
    },
};

/**
 * Notifications Page Component
 */
const Notifications = () => {
    return (
        <div style={CONTAINER_STYLES.container} className="bg-white">
            {/* Mobile Navigation */}
            <div className="md:hidden sm:block">
                <ModileNav />
            </div>

            {/* Main Content */}
            <div style={CONTAINER_STYLES.middle}>
                <NotificationData />
            </div>
        </div>
    );
};

export default Notifications;
