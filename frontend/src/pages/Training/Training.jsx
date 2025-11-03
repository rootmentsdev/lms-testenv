/**
 * Training Page Component
 * 
 * Wrapper component for training management page
 * Handles mobile navigation display
 * 
 * @returns {JSX.Element} - Training page component
 */
import ModileNav from "../../components/SideNav/ModileNav";
import TrainingData from "./TrainingData";

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
 * Training Page Component
 */
const Training = () => {
    return (
        <div style={CONTAINER_STYLES.container} className="bg-white">
            {/* Mobile Navigation */}
            <div className="md:hidden sm:block">
                <ModileNav />
            </div>

            {/* Main Content */}
            <div style={CONTAINER_STYLES.middle}>
                <TrainingData />
            </div>
        </div>
    );
};

export default Training;
