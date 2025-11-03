/**
 * Home Page Component
 * 
 * Main home page that renders different dashboard views based on user role
 * - super_admin: Full dashboard (HomeData)
 * - cluster_admin: Cluster dashboard (HomeDatacluster)
 * - store_admin: Store dashboard (HomeDatastore)
 * 
 * @returns {JSX.Element} - Home page component
 */
import { useSelector } from 'react-redux';
import ModileNav from "../../components/SideNav/ModileNav";
import HomeData from "./HomeData";
import HomeDatacluster from './HomeDatacluster';
import HomeDatastore from './HomeDatastore';

/**
 * User role constants
 */
const USER_ROLES = {
    SUPER_ADMIN: 'super_admin',
    CLUSTER_ADMIN: 'cluster_admin',
    STORE_ADMIN: 'store_admin',
};

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
 * Home Page Component
 */
const Home = () => {
    const user = useSelector((state) => state.auth.user);

    /**
     * Renders the appropriate dashboard component based on user role
     * 
     * @returns {JSX.Element} - Dashboard component
     */
    const renderDashboard = () => {
        if (user?.role === USER_ROLES.SUPER_ADMIN) {
            return <HomeData user={user} />;
        }

        if (user?.role === USER_ROLES.CLUSTER_ADMIN) {
            return <HomeDatacluster user={user} />;
        }

        // Default to store admin dashboard
        return <HomeDatastore user={user} />;
    };

    return (
        <div style={CONTAINER_STYLES.container} className="bg-white">
            {/* Mobile Navigation */}
            <div className="md:hidden sm:block">
                <ModileNav />
            </div>

            {/* Main Content */}
            <div style={CONTAINER_STYLES.middle}>
                {renderDashboard()}
            </div>
        </div>
    );
};

export default Home;
