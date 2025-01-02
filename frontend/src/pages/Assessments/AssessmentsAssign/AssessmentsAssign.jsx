import SideNav from "../../../components/SideNav/SideNav";
import AssessmentsAssignData from "./AssessmentsAssignData";

const AssessmentsAssign = () => {
    return (
        <>
            <div style={styles.container}>
                <div style={styles.left} className=" hidden lg:block z-50">
                    <SideNav name='Assessments Assign' />
                </div>


                <div style={styles.middle} className="lg:ml-[273px] ">
                    <AssessmentsAssignData />
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
    },
    middle: {
        flex: 1,
        width: 100
    }
};
export default AssessmentsAssign