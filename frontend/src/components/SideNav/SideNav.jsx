import { useLocation, Link } from "react-router-dom";
import { MdModelTraining, MdOutlineStoreMallDirectory, MdOutlineTopic, MdOutlineAssessment } from "react-icons/md";
import { IoIosLogOut } from "react-icons/io";
import { FaRegIdCard } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";

import image from '../../../public/Rootments.jpg'

const SideNav = () => {
    const location = useLocation(); // Get the current route path

    // Helper function to check if the link is active
    const isActive = (path) => location.pathname === path;

    return (
        <div className="lg:w-[273px] h-full md:w-[90px]  md:mx-auto bg-[#F4F4F4] flex flex-col fixed top-0 left-0 ">
            {/* Header Section */}
            <div className="flex mt-10 ml-5 lg:justify-evenly">
                <div>
                    <img src={image} alt="Logo" />
                </div>
                <div className="hidden lg:block">
                    <div className="text-2xl text-green-700">
                        ROOTMENTS
                    </div>
                    <div className="flex justify-end text-sm">
                        ENTERPRISE
                    </div>
                </div>
            </div>

            {/* Navigation Links */}
            <div className="mt-10 flex flex-col  text-md text-black ml-10 space-y-6 ">
                {/* Dashboard Section */}
                <Link to={'/'}>
                    <div className={`flex justify-start items-center space-x-4 p-2 rounded-lg transition-all duration-200 
                        ${isActive('/') ? 'bg-[#016E5B] text-white' : ''}`}>
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
                        <div className="hidden lg:block">Dashboard</div>
                    </div>
                </Link>

                {/* Employee Section */}
                <Link to={'/employee'}>
                    <div className={`flex justify-start items-center space-x-4 p-2 rounded-lg transition-all duration-200 
                        ${isActive('/employee') ? 'bg-[#016E5B] text-white' : ''}`}>
                        <FaRegIdCard className="text-xl" />
                        <div className="hidden lg:block">Employee</div>
                    </div>
                </Link>

                {/* Trainings Section */}
                <Link to={'/training'}>
                    <div className={`flex justify-start items-center space-x-4 p-2 rounded-lg transition-all duration-200 
                        ${isActive('/training') ? 'bg-[#016E5B] text-white' : ''}`}>
                        <MdModelTraining className="text-2xl" />
                        <div className="hidden lg:block">Trainings</div>
                    </div>
                </Link>

                {/* Assessments Section */}
                <Link to={'/assessments'}>
                    <div className={`flex justify-start items-center space-x-4 p-2 rounded-lg transition-all duration-200 
                        ${isActive('/assessments') ? 'bg-[#016E5B] text-white' : ''}`}>
                        <MdOutlineAssessment className="text-xl" />
                        <div className="hidden lg:block">Assessments</div>
                    </div>
                </Link>

                {/* Module Section */}
                <Link to={'/module'}>
                    <div className={`flex justify-start items-center space-x-4 p-2 rounded-lg transition-all duration-200 
                        ${isActive('/module') ? 'bg-[#016E5B] text-white' : ''}`}>
                        <MdOutlineTopic className="text-xl" />
                        <div className="hidden lg:block">Module</div>
                    </div>
                </Link>

                {/* Branch Section */}
                <Link to={'/branch'}>
                    <div className={`flex justify-start items-center space-x-4 p-2 rounded-lg transition-all duration-200 
                        ${isActive('/branch') ? 'bg-[#016E5B] text-white' : ''}`}>
                        <MdOutlineStoreMallDirectory className="text-xl" />
                        <div className="hidden lg:block">Branch</div>
                    </div>
                </Link>

                {/* Settings Section */}
                <Link to={'/settings'}>
                    <div className={`flex justify-start items-center space-x-4 p-2 rounded-lg transition-all duration-200 
                        ${isActive('/settings') ? 'bg-[#016E5B] text-white' : ''}`}>
                        <IoSettingsOutline className="text-xl" />
                        <div className="hidden lg:block">Settings</div>
                    </div>
                </Link>

                {/* Logout Section */}
                <div className="flex justify-start cursor-pointer items-center space-x-4 hover:bg-[#016E5B] hover:text-white p-2 rounded-lg transition-all duration-200">
                    <IoIosLogOut className="text-xl" />
                    <div className="hidden lg:block">Logout</div>
                </div>
            </div>
        </div>
    );
};

export default SideNav;
