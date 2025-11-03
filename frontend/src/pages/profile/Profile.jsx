/**
 * Profile Page Component
 * 
 * Wrapper component for user profile page
 * Handles mobile navigation display
 * 
 * @returns {JSX.Element} - Profile page component
 */
import ModileNav from "../../components/SideNav/ModileNav";
import ProfileData from "./ProfileData";

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
 * Profile Page Component
 */
const Profile = () => {
    return (
        <div style={CONTAINER_STYLES.container} className="bg-white">
            {/* Mobile Navigation */}
            <div className="md:hidden sm:block">
                <ModileNav />
            </div>

            {/* Main Content */}
            <div style={CONTAINER_STYLES.middle}>
                <ProfileData />
            </div>
        </div>
    );
};

export default Profile;
