/**
 * Branch Details Page Component
 * 
 * Wrapper component for branch details page
 * Handles mobile navigation display
 * 
 * @returns {JSX.Element} - Branch details page component
 */
import ModileNav from "../../../components/SideNav/ModileNav";
import BranchDetailsData from "./BranchDetailsData";

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
 * Branch Details Page Component
 */
const BranchDetails = () => {
    return (
        <div style={CONTAINER_STYLES.container} className="bg-white">
            {/* Mobile Navigation */}
            <div className="md:hidden sm:block">
                <ModileNav />
            </div>

            {/* Main Content */}
            <div style={CONTAINER_STYLES.middle}>
                <BranchDetailsData />
            </div>
        </div>
    );
};

export default BranchDetails;
