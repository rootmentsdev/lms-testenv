import Header from "../../components/Header/Header";
import SideNav from "../../components/SideNav/SideNav";
import DashboardOverview from "../../components/DashboardOverview/DashboardOverview";
import DailyWalkings from "../../components/DailyWalkings/DailyWalkings";
import TaskOverview from "../../components/TaskOverview/TaskOverview";
import HomeBar from "../../components/HomeBar/HomeBar";

const HomeData = ({ user }) => {
    return (
        <div className="mx-0 mb-[90px]">
            <Header name="Dashboard" />
            <div className="flex">
                <SideNav />
                <div className="md:ml-[120px] mt-[68px] w-full">
                    <div className="px-6 mt-6">
                        <DashboardOverview user={user} />
                    </div>

                    {/* Daily Walkings + Task Overview row */}
                    <div className="px-6 mt-4 flex gap-4">
                        <DailyWalkings />
                        <TaskOverview />
                    </div>

                    {/* Training Progress bar chart */}
                    <div className="px-6 mt-4 mb-8">
                        <HomeBar />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeData;
