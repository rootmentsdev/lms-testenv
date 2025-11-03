/**
 * Add Branch Page Component
 * 
 * Wrapper component for add branch page
 * Handles mobile navigation display
 * 
 * @returns {JSX.Element} - Add branch page component
 */
import ModileNav from "../../components/SideNav/ModileNav";
import AddBranchData from "./AddBranchData";

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
 * Add Branch Page Component
 */
const AddBranch = () => {
    return (
        <div style={CONTAINER_STYLES.container} className="bg-white">
            {/* Mobile Navigation */}
            <div className="md:hidden sm:block">
                <ModileNav />
            </div>

            {/* Main Content */}
            <div style={CONTAINER_STYLES.middle}>
                <AddBranchData />
            </div>
        </div>
    );
};

export default AddBranch;
