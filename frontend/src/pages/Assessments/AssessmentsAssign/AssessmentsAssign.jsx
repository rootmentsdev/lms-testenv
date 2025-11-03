/**
 * Assessments Assign Page Component
 * 
 * Wrapper component for assessments assign page
 * Handles mobile navigation display
 * 
 * @returns {JSX.Element} - Assessments assign page component
 */
import ModileNav from "../../../components/SideNav/ModileNav";
import AssessmentsAssignData from "./AssessmentsAssignData";

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
 * Assessments Assign Page Component
 */
const AssessmentsAssign = () => {
    return (
        <div style={CONTAINER_STYLES.container} className="bg-white">
            {/* Mobile Navigation */}
            <div className="md:hidden sm:block">
                <ModileNav />
            </div>

            {/* Main Content */}
            <div style={CONTAINER_STYLES.middle}>
                <AssessmentsAssignData />
            </div>
        </div>
    );
};

export default AssessmentsAssign;
