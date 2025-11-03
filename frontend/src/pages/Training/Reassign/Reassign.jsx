/**
 * Reassign Training Page Component
 * 
 * Wrapper component for reassign training page
 * Handles mobile navigation display
 * 
 * @returns {JSX.Element} - Reassign training page component
 */
import ModileNav from '../../../components/SideNav/ModileNav';
import ReassignData from './ReassignData';

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
 * Reassign Training Page Component
 */
const Reassign = () => {
    return (
        <div style={CONTAINER_STYLES.container} className="bg-white">
            {/* Mobile Navigation */}
            <div className="md:hidden sm:block">
                <ModileNav />
            </div>

            {/* Main Content */}
            <div style={CONTAINER_STYLES.middle}>
                <ReassignData />
            </div>
        </div>
    );
};

export default Reassign;
