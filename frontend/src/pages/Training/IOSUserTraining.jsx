import IOSUserTrainingData from "./IOSUserTrainingData";
import ModileNav from "../../components/SideNav/ModileNav";

const IOSUserTraining = () => {
    return (
        <>
            <div style={styles.container} className="bg-white">
                <div className="md:hidden sm:block">
                    <ModileNav />
                </div>

                <div style={styles.middle} className="">
                    <IOSUserTrainingData />
                </div>
            </div>
        </>
    );
}

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

export default IOSUserTraining;
