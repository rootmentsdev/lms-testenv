
import ModileNav from "../../components/SideNav/ModileNav";
import AssessmentOverDuedata from "./AssessmentOverDuedata";


const AssessmentOverDue = () => {


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
                    <AssessmentOverDuedata />
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

export default AssessmentOverDue;

