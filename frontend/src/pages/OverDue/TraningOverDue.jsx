/**
 * Training Overdue Page Component
 * 
 * Wrapper component for training overdue page
 * Handles mobile navigation display
 * 
 * @returns {JSX.Element} - Training overdue page component
 */
import ModileNav from "../../components/SideNav/ModileNav";
import TraningOverDuedata from "./TraningOverDuedata";

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
 * Training Overdue Page Component
 */
const TraningOverDue = () => {
    return (
        <div style={CONTAINER_STYLES.container} className="bg-white">
            {/* Mobile Navigation */}
            <div className="md:hidden sm:block z-10">
                <ModileNav />
            </div>

            {/* Main Content */}
            <div style={CONTAINER_STYLES.middle}>
                <TraningOverDuedata />
            </div>
        </div>
    );
};

export default TraningOverDue;
