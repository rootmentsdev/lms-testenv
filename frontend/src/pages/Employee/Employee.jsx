/**
 * Employee Page Component
 * 
 * Wrapper component for employee management page
 * Handles mobile navigation display
 * 
 * @returns {JSX.Element} - Employee page component
 */
import ModileNav from "../../components/SideNav/ModileNav";
import EmployeeData from "./EmployeeData";

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
 * Employee Page Component
 */
const Employee = () => {
    return (
        <div style={CONTAINER_STYLES.container} className="bg-white">
            {/* Mobile Navigation */}
            <div className="md:hidden sm:block">
                <ModileNav />
            </div>

            {/* Main Content */}
            <div style={CONTAINER_STYLES.middle}>
                <EmployeeData />
            </div>
        </div>
    );
};

export default Employee;
