/**
 * Assessments Page Component
 * 
 * Wrapper component for assessments management page
 * Handles mobile navigation display
 * 
 * @returns {JSX.Element} - Assessments page component
 */
import ModileNav from "../../components/SideNav/ModileNav";
import AssessmentsData from "./AssessmentsData";

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
 * Assessments Page Component
 */
const Assessments = () => {
    return (
        <div style={CONTAINER_STYLES.container} className="bg-white">
            {/* Mobile Navigation */}
            <div className="md:hidden sm:block">
                <ModileNav />
            </div>

            {/* Main Content */}
            <div style={CONTAINER_STYLES.middle}>
                <AssessmentsData />
            </div>
        </div>
    );
};

export default Assessments;
