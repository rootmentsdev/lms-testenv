import SideNav from "../../components/SideNav/SideNav";
import BranchData from "./BranchData";

const Branch = () => {
    return (
        <>
            <div style={styles.container}>
                <div style={styles.left} className=" hidden lg:block z-50">
                    <SideNav />
                </div>


                <div style={styles.middle}  className="lg:ml-[273px] ">
                    <BranchData />
                </div>



            </div>
        </>
    )
}


const styles = {
    container: {
        display: "flex",
        width: "100%",
        minHeight: "100vh",

    },
    left: {
        // Adjust size





    },
    middle: {
        flex: 1,
        width: 100
    }


};
export default Branch