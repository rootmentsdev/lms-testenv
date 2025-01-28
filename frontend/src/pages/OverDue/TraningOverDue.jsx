
import ModileNav from "../../components/SideNav/ModileNav";
import TraningOverDuedata from "./TraningOverDuedata";


const TraningOverDue = () => {


    // Debugging: Inspect user data

    return (
        <>
            <div style={styles.container} className="bg-white">
                {/* Mobile Navigation */}
                <div className="md:hidden block z-10">
                    <ModileNav />
                </div>

                {/* Main Content */}
                <div style={styles.middle}>
                    <TraningOverDuedata />
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

export default TraningOverDue;

