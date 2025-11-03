/**
 * Employee Detail Page Component
 * 
 * Wrapper component for employee detail page
 * Handles mobile navigation display
 * 
 * @returns {JSX.Element} - Employee detail page component
 */
import ModileNav from "../../../components/SideNav/ModileNav";
import EmployeeDetaileData from "./EmployeeDetaileData";

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
 * Employee Detail Page Component
 */
const EmployeeDetaile = () => {
    return (
        <div style={CONTAINER_STYLES.container} className="bg-white">
            {/* Mobile Navigation */}
            <div className="md:hidden sm:block">
                <ModileNav />
            </div>

            {/* Main Content */}
            <div style={CONTAINER_STYLES.middle}>
                <EmployeeDetaileData />
            </div>
        </div>
    );
};

export default EmployeeDetaile;
