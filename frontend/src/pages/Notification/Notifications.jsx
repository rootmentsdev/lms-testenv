
import ModileNav from "../../components/SideNav/ModileNav";
import NotificationData from "./NotificationData";


const Notifications = () => {


    // Debugging: Inspect user data

    return (
        <>
            <div style={styles.container} className="bg-white">
                {/* Mobile Navigation */}
                <div className="md:hidden sm:block">
                    <ModileNav />
                </div>

                {/* Main Content */}
                <div style={styles.middle}>
                    <NotificationData /> 
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

export default Notifications;

