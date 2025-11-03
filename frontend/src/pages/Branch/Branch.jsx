/**
 * Branch Page Component
 * 
 * Wrapper component for branch management page
 * Handles mobile navigation display
 * 
 * @returns {JSX.Element} - Branch page component
 */
import ModileNav from "../../components/SideNav/ModileNav";
import BranchData from "./BranchData";

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
 * Branch Page Component
 */
const Branch = () => {
    return (
        <div style={CONTAINER_STYLES.container} className="bg-white">
            {/* Mobile Navigation */}
            <div className="md:hidden sm:block">
                <ModileNav />
            </div>

            {/* Main Content */}
            <div style={CONTAINER_STYLES.middle}>
                <BranchData />
            </div>
        </div>
    );
};

export default Branch;
