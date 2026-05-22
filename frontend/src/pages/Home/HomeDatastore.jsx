import Header from "../../components/Header/Header";
import SideNav from "../../components/SideNav/SideNav";
import TopEmployeeAndBranch from "../../components/TopEmployeeAndBranch/TopEmployeeAndBranch";
import Notification from "../../components/Notification/Notification";
import TrainingProgress from "../../components/StoreManager/TrainingProgress";
import OverdueTrainings from "../../components/StoreManager/OverdueTrainings";

const HomeDatastore = ({ user }) => {
    return (
        <div className="mx-0 mb-[90px]">
            <Header name="Dashboard" />
            <div className="flex">
                <SideNav />
                <div className="md:ml-[120px] mt-[100px]">
                    <div className="ml-12 text-black">
                        <div className="flex items-center gap-3 mt-5 mb-4">
                            <div className="flex items-center gap-2">
                                <p className="text-lg font-medium text-gray-700">Hello,</p>
                                <div className="bg-gradient-to-r from-[#016E5B] to-[#01997A] text-white px-4 py-2 rounded-full shadow-lg">
                                    <span className="text-lg font-bold capitalize">
                                        {user.role?.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm md:text-lg">Your dashboard is ready, Let's create a productive learning environment!</p>
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
