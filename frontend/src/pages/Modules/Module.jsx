/**
 * Module Page Component
 * 
 * Wrapper component for module management page
 * Handles mobile navigation display
 * 
 * @returns {JSX.Element} - Module page component
 */
import ModileNav from "../../components/SideNav/ModileNav";
import ModuleData from "./ModuleData";

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
 * Module Page Component
 */
const Module = () => {
    return (
        <div style={CONTAINER_STYLES.container} className="bg-white">
            {/* Mobile Navigation */}
            <div className="md:hidden sm:block">
                <ModileNav />
            </div>

            {/* Main Content */}
            <div style={CONTAINER_STYLES.middle}>
                <ModuleData />
            </div>
        </div>
    );
};

export default Module;
