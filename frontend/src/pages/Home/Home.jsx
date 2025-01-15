import { useSelector } from 'react-redux';
import ModileNav from "../../components/SideNav/ModileNav";
import HomeData from "./HomeData";
import HomeDatacluster from './HomeDatacluster';
import HomeDatastore from './HomeDatastore';

const Home = () => {
    const user = useSelector((state) => state.auth.user); // Access user from Redux store

    console.log("User from Redux:", user); // Debugging: Inspect user data

    return (
        <>
            <div style={styles.container} className="bg-white">
                {/* Mobile Navigation */}
                <div className="md:hidden sm:block">
                    <ModileNav />
                </div>

                {/* Main Content */}
                <div style={styles.middle}>
                    {user?.role === 'super_admin' ? (
                        <HomeData user={user} />
                    ) : (
                        user?.role === 'cluster_admin' ? (<HomeDatacluster user={user} />) : (<HomeDatastore user={user} />)
                    )}
                </div>
            </div>
        </>
    );
};

const styles = {
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

export default Home;
