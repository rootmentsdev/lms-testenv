import ModileNav from "../../components/SideNav/ModileNav";
// import SideNav from "../../components/SideNav/SideNav";
import HomeData from "./HomeData";

const Home = () => {
    return (
        <>
            <div style={styles.container} className="bg-white">

                <div className="md:hidden sm:block">
                    <ModileNav />
                </div>

                <div style={styles.middle} className=" ">
                    <HomeData />
                </div>
            </div>
        </>
    );
}

const styles = {
    container: {
        display: "flex",
        width: "100%",
        minHeight: "100vh", // Ensure it takes the full height of the viewport
        backgroundColor: "white", // Set background color to white for the entire container
        overflowX: "hidden", // Prevent horizontal scrolling
    },
    left: {
        // Adjust size as needed for the sidebar
    },
    middle: {
        flex: 1,
        width: "100%", // Ensure it takes the full width of the remaining space
        minHeight: "100vh", // Ensure it stretches vertically
    },
};

export default Home;
