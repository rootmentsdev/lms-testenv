/**
 * Create Training Page Component
 * 
 * Wrapper component for create training page
 * Handles mobile navigation display
 * 
 * @returns {JSX.Element} - Create training page component
 */
import ModileNav from "../../components/SideNav/ModileNav";
import CreateTrainingData from "./CreateTrainingData";

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
 * Create Training Page Component
 */
const CreateTraining = () => {
    return (
        <div style={CONTAINER_STYLES.container} className="bg-white">
            {/* Mobile Navigation */}
            <div className="md:hidden sm:block">
                <ModileNav />
            </div>

            {/* Main Content */}
            <div style={CONTAINER_STYLES.middle}>
                <CreateTrainingData />
            </div>
        </div>
    );
};

export default CreateTraining;
