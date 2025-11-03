/**
 * Settings Page Component
 * 
 * Wrapper component for settings management page
 * Handles mobile navigation display
 * 
 * @returns {JSX.Element} - Settings page component
 */
import ModileNav from "../../components/SideNav/ModileNav";
import SettingData from "./SettingData";

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
 * Settings Page Component
 */
const Setting = () => {
    return (
        <div style={CONTAINER_STYLES.container} className="bg-white">
            {/* Mobile Navigation */}
            <div className="md:hidden sm:block">
                <ModileNav />
            </div>

            {/* Main Content */}
            <div style={CONTAINER_STYLES.middle}>
                <SettingData />
            </div>
        </div>
    );
};

export default Setting;
