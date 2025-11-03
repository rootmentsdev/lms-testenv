/**
 * Create Module Page Component
 * 
 * Wrapper component for create module page
 * Handles mobile navigation display
 * 
 * @returns {JSX.Element} - Create module page component
 */
import ModileNav from "../../../components/SideNav/ModileNav";
import CreateModuleData from "./CreateModuleData";

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
 * Create Module Page Component
 */
const CreateModule = () => {
    return (
        <div style={CONTAINER_STYLES.container} className="bg-white">
            {/* Mobile Navigation */}
            <div className="md:hidden sm:block">
                <ModileNav />
            </div>

            {/* Main Content */}
            <div style={CONTAINER_STYLES.middle}>
                <CreateModuleData />
            </div>
        </div>
    );
};

export default CreateModule;
