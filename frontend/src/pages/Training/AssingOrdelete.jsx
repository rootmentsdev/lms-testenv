/**
 * Assign or Delete Training Page Component
 * 
 * Wrapper component for assign/delete training page
 * Handles mobile navigation display
 * 
 * @returns {JSX.Element} - Assign or delete training page component
 */
import ModileNav from "../../components/SideNav/ModileNav";
import AssingOrdeletedata from "./AssingOrdeletedata";

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
 * Assign or Delete Training Page Component
 */
const AssingOrdelete = () => {
    return (
        <div style={CONTAINER_STYLES.container} className="bg-white">
            {/* Mobile Navigation */}
            <div className="md:hidden sm:block">
                <ModileNav />
            </div>

            {/* Main Content */}
            <div style={CONTAINER_STYLES.middle}>
                <AssingOrdeletedata />
            </div>
        </div>
    );
};

export default AssingOrdelete;
