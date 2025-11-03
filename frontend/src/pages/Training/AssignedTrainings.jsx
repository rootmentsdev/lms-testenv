/**
 * Assigned Trainings Page Component
 * 
 * Wrapper component for assigned trainings page
 * Handles mobile navigation display
 * 
 * @returns {JSX.Element} - Assigned trainings page component
 */
import ModileNav from "../../components/SideNav/ModileNav";
import AssignedTrainingsData from "./AssignedTrainingsData";

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
 * Assigned Trainings Page Component
 */
const AssignedTrainings = () => {
    return (
        <div style={CONTAINER_STYLES.container} className="bg-white">
            {/* Mobile Navigation */}
            <div className="md:hidden sm:block">
                <ModileNav />
            </div>

            {/* Main Content */}
            <div style={CONTAINER_STYLES.middle}>
                <AssignedTrainingsData />
            </div>
        </div>
    );
};

export default AssignedTrainings;
