import SideNav from "../../components/SideNav/SideNav";
import ModileNav from "../../components/SideNav/ModileNav";
import CreateCustomNotification from "./CreateNotification";

const CreateNotificationPage = () => {
    return (
        <div className="flex w-full min-h-screen bg-gray-50 overflow-x-hidden">
            {/* Sidebar */}
            <div className="hidden md:block z-50">
                <SideNav />
            </div>
            <div className="md:hidden sm:block">
                <ModileNav />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 md:ml-[110px] p-6 flex flex-col">
                <CreateCustomNotification />
            </div>
        </div>
    );
};

export default CreateNotificationPage;
