import SideNav from "../../components/SideNav/SideNav";
import BranchData from "./BranchData";
import ModileNav from "../../components/SideNav/ModileNav";

const Branch = () => {
    return (
        <>
            <div style={styles.container} className="bg-white">
                <div style={styles.left} className="hidden md:block z-50">
                    <SideNav />
                </div>
                <div className="md:hidden sm:block">
                    <ModileNav />
                </div>

                <div style={styles.middle} className="lg:ml-[273px] md:ml-[90px] ml-[0px]">
                    <BranchData />
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

export default Branch