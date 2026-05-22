import Header from "../../components/Header/Header";
import SideNav from "../../components/SideNav/SideNav";
import TopEmployeeAndBranch from "../../components/TopEmployeeAndBranch/TopEmployeeAndBranch";
import Notification from "../../components/Notification/Notification";
import TrainingProgress from "../../components/StoreManager/TrainingProgress";
import OverdueTrainings from "../../components/StoreManager/OverdueTrainings";
import DashboardOverview from "../../components/DashboardOverview/DashboardOverview";

const HomeDatastore = ({ user }) => {
    return (
        <div className="mx-0 mb-[90px]">
            <Header name="Dashboard" />
            <div className="flex">
                <SideNav />
                <div className="md:ml-[120px] mt-[104px] w-full">
                    <div className="px-6 mt-6">
                        <DashboardOverview user={user} />
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap gap-10">
                <div className="ml-[130px]">
                    <TrainingProgress />
                </div>
                <div className="h-[360px] w-[600px] rounded-xl">
                    <TopEmployeeAndBranch />
                </div>
                <div className="ml-[130px] mt-[-100px]">
                    <Notification />
                </div>
                <div className="ml-[-100px] mt-10">
                    <OverdueTrainings />
                </div>
            </div>
        </div>
    );
};

export default HomeDatastore;
