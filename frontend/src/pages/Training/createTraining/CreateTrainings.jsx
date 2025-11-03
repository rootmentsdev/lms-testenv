/**
 * Create Trainings Page Component
 * 
 * Wrapper component for create trainings page
 * Handles mobile navigation display
 * 
 * @returns {JSX.Element} - Create trainings page component
 */
import ModileNav from "../../../components/SideNav/ModileNav";
import CreateTrainingDatas from "./CreateTrainingDatas";

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
 * Create Trainings Page Component
 */
const CreateTrainings = () => {
    return (
        <div style={CONTAINER_STYLES.container} className="bg-white">
            {/* Mobile Navigation */}
            <div className="md:hidden sm:block">
                <ModileNav />
            </div>

            {/* Main Content */}
            <div style={CONTAINER_STYLES.middle}>
                <CreateTrainingDatas />
            </div>
        </div>
    );
};

export default CreateTrainings;
