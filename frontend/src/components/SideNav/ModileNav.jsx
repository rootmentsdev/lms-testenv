import { useLocation, Link } from "react-router-dom";
import { MdModelTraining, MdOutlineStoreMallDirectory, MdOutlineAssessment } from "react-icons/md";
// import { IoIosLogOut } from "react-icons/io";
import { FaRegIdCard } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";

const SideNav = () => {
    const location = useLocation(); // Get the current route path

    // Helper function to check if the link is active
    const isActive = (path) => location.pathname === path;

    return (
        <div className=" h-[70px] z-10 bg-[#F4F4F4] flex items-center fixed bottom-0 left-0 right-0 px-4 w-auto shadow-md">
            {/* Navigation Links */}
            <div className="flex justify-between w-full text-md text-black space-x-4">
                {/* Dashboard Section */}
                <Link to={'/'}>
                    <div className={`flex flex-col items-center space-y-1 transition-all duration-200 
                        ${isActive('/') ? 'text-[#016E5B]' : ''}`}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                        >
                            <path
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 4h4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1m0 12h4a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1m10-4h4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1m0-8h4a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1"
                            />
                        </svg>
                    </div>
                </Link>

                {/* Employee Section */}
                <Link to={'/employee'}>
                    <div className={`flex flex-col items-center space-y-1 transition-all duration-200 
                        ${isActive('/employee') ? 'text-[#016E5B]' : ''}`}>
                        <FaRegIdCard className="text-xl" />
                    </div>
                </Link>

                {/* Trainings Section */}
                <Link to={'/training'}>
                    <div className={`flex flex-col items-center space-y-1 transition-all duration-200 
                        ${isActive('/training') ? 'text-[#016E5B]' : ''}`}>
                        <MdModelTraining className="text-2xl" />
                    </div>
                </Link>

                {/* Assessments Section */}
                <Link to={'/assessments'}>
                    <div className={`flex flex-col items-center space-y-1 transition-all duration-200 
                        ${isActive('/assessments') ? 'text-[#016E5B]' : ''}`}>
                        <MdOutlineAssessment className="text-xl" />
                    </div>
                </Link>

                {/* Module Section */}


                {/* Branch Section */}
                <Link to={'/branch'}>
                    <div className={`flex flex-col items-center space-y-1 transition-all duration-200 
                        ${isActive('/branch') ? 'text-[#016E5B]' : ''}`}>
                        <MdOutlineStoreMallDirectory className="text-xl" />

                    </div>
                </Link>

                {/* Settings Section */}
                <Link to={'/settings'}>
                    <div className={`flex flex-col items-center space-y-1 transition-all duration-200 
                        ${isActive('/settings') ? 'text-[#016E5B]' : ''}`}>
                        <IoSettingsOutline className="text-xl" />
                    </div>
                </Link>

                {/* Logout Section */}

            </div>
        </div>
    );
};

export default SideNav;
