// import SideNav from "../../../components/SideNav/SideNav";

import ModileNav from "../../../components/SideNav/ModileNav";

import CreateTrainingDatas from "./CreateTrainingDatas";

const CreateTrainings = () => {
    return (
        <>
            <div style={styles.container}>
                {/* <div style={styles.left} className=" hidden lg:block z-50">
                    <SideNav />
                </div> */}
                <div className="md:hidden sm:block">
                    <ModileNav />
                </div>


                <div style={styles.middle} className="">
                    < CreateTrainingDatas />
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
export default CreateTrainings