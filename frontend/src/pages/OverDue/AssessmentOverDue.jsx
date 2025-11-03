/**
 * Assessment Overdue Page Component
 * 
 * Wrapper component for assessment overdue page
 * Handles mobile navigation display
 * 
 * @returns {JSX.Element} - Assessment overdue page component
 */
import ModileNav from "../../components/SideNav/ModileNav";
import AssessmentOverDuedata from "./AssessmentOverDuedata";

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
 * Assessment Overdue Page Component
 */
const AssessmentOverDue = () => {
    return (
        <div style={CONTAINER_STYLES.container} className="bg-white">
            {/* Mobile Navigation */}
            <div className="md:hidden sm:block">
                <ModileNav />
            </div>

            {/* Main Content */}
            <div style={CONTAINER_STYLES.middle}>
                <AssessmentOverDuedata />
            </div>
        </div>
    );
};

export default AssessmentOverDue;
