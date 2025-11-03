/**
 * User Training Progress Page Component
 * 
 * Wrapper component for user training progress page
 * Handles mobile navigation display
 * 
 * @returns {JSX.Element} - User training progress page component
 */
import ModileNav from "../../../components/SideNav/ModileNav";
import UserTrainingProgressData from "./UserTrainingProgressData";

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
 * User Training Progress Page Component
 */
const UserTrainingProgress = () => {
    return (
        <div style={CONTAINER_STYLES.container} className="bg-white">
            {/* Mobile Navigation */}
            <div className="md:hidden sm:block">
                <ModileNav />
            </div>

            {/* Main Content */}
            <div style={CONTAINER_STYLES.middle}>
                <UserTrainingProgressData />
            </div>
        </div>
    );
};

export default UserTrainingProgress;
