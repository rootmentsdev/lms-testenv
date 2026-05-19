import { useLocation, Link } from "react-router-dom";
import { MdModelTraining, MdOutlineStoreMallDirectory, MdOutlineTopic, MdOutlineAssessment } from "react-icons/md";
import { IoIosLogOut } from "react-icons/io";
import { FaRegIdCard } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { IoChatbubblesOutline } from "react-icons/io5";
import { MdKeyboardArrowDown } from "react-icons/md";
import LogoutConfirmation from "../LogoutConfirmation/LogoutConfirmation";
import { logout } from "../../features/auth/authSlice";


const SideNav = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const location = useLocation(); // Get the current route path
    const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
    
    const isActive = (path) => location.pathname === path;
    const isWalkinActive = isActive('/walkin/list') || isActive('/walkin/report');
    const [isWalkinOpen, setIsWalkinOpen] = useState(isWalkinActive);

    useEffect(() => {
        if (isWalkinActive) {
            setIsWalkinOpen(true);
        }
    }, [location.pathname, isWalkinActive]);

    const handleLogoutClick = () => {
        setShowLogoutConfirmation(true);
    };

    const handleLogoutConfirm = () => {
        // Remove token from localStorage
        localStorage.removeItem('token');
        // Dispatch logout action to clear Redux state
        dispatch(logout());
        // Redirect to login page
        navigate('/login');
    };

    return (
        <div className="fixed hidden md:flex top-36 z-40 left-5 bg-[#F4F4F4] items-center rounded-2xl  flex-col transition-all md:w-[90px]  group lg:w-[90px] lg:hover:w-64  duration-500">
            {/* Navigation Links */}
            <div className="mt-5 mb-5 flex flex-col text-md  lg:group-hover:w-56 text-black space-y-6">
                {/* Dashboard Section */}
                <Link to={'/'}>
                    <div className={`flex justify-center lg:justify-start items-center space-x-4 p-2 rounded-lg transition-all duration-500
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
                        <div className="hidden lg:group-hover:block">Dashboard</div>
                    </div>
                </Link>

                {/* Walk-In Section */}
                <div className="flex flex-col cursor-pointer">
                    <div 
                        className={`flex justify-center lg:justify-start items-center space-x-4 p-2 rounded-lg transition-all duration-500
                        ${isWalkinActive && !isWalkinOpen ? 'bg-[#016E5B] text-white' : 'hover:bg-[#016E5B] hover:text-white'}`}
                        onClick={() => setIsWalkinOpen(!isWalkinOpen)}
                    >
                        <IoChatbubblesOutline className="text-xl" />
                        <div className="hidden lg:group-hover:flex flex-1 items-center justify-between">
                            <span>Walk-In</span>
                            <MdKeyboardArrowDown className={`transition-transform duration-200 ${isWalkinOpen ? 'rotate-180' : ''}`} />
                        </div>
                    </div>
                    
                    {isWalkinOpen && (
                        <div className="hidden lg:group-hover:flex flex-col ml-8 mt-2 space-y-2">
                            <Link to={'/walkin/list'} className={`text-sm hover:text-[#016E5B] ${isActive('/walkin/list') ? 'text-[#016E5B] font-semibold' : 'text-gray-500'}`}>
                                Walkin List
                            </Link>
                            <Link to={'/walkin/report'} className={`text-sm hover:text-[#016E5B] ${isActive('/walkin/report') ? 'text-[#016E5B] font-semibold' : 'text-gray-500'}`}>
                                Walkin Report
                            </Link>
                        </div>
                    )}
                </div>

                {/* Employee Section */}
                <Link to={'/employee'}>
                    <div className={`flex justify-center lg:justify-start items-center space-x-4 p-2 rounded-lg transition-all duration-500
                    ${isActive('/employee') ? 'bg-[#016E5B] text-white' : ''}`}>
                        <FaRegIdCard className="text-xl" />
                        <div className="hidden lg:group-hover:block">Employee</div>
                    </div>
                </Link>

                {/* Trainings Section */}
                <Link to={'/training'}>
                    <div className={`flex justify-center lg:justify-start items-center space-x-4 p-2 rounded-lg transition-all duration-500
                    ${isActive('/training') || isActive('/AssigData') || isActive('/Alltraining') || isActive('/createnewtraining') || isActive('/create/Mandatorytraining') ? 'bg-[#016E5B] text-white' : ''}`}>
                        <MdModelTraining className="text-2xl" />
                        <div className="hidden lg:group-hover:block">Trainings</div>
                    </div>
                </Link>

                {/* Assessments Section */}
                <Link to={'/assessments'}>
                    <div className={`flex justify-center lg:justify-start items-center space-x-4 p-2 rounded-lg transition-all duration-500
                    ${isActive('/assessments') ? 'bg-[#016E5B] text-white' : ''}`}>
                        <MdOutlineAssessment className="text-xl" />
                        <div className="hidden lg:group-hover:block">Assessments</div>
                    </div>
                </Link>

                {/* Module Section */}
                <Link to={'/module'}>
                    <div className={`flex justify-center lg:justify-start items-center space-x-4 p-2 rounded-lg transition-all duration-500
                    ${isActive('/module') ? 'bg-[#016E5B] text-white' : ''}`}>
                        <MdOutlineTopic className="text-xl" />
                        <div className="hidden lg:group-hover:block">Module</div>
                    </div>
                </Link>

                {/* Branch Section */}
                <Link to={'/branch'}>
                    <div className={`flex justify-center lg:justify-start items-center space-x-4 p-2 rounded-lg transition-all duration-500
                    ${isActive('/branch') || isActive("/Addbranch") ? 'bg-[#016E5B] text-white' : ''}`}>
                        <MdOutlineStoreMallDirectory className="text-xl" />
                        <div className="hidden lg:group-hover:block">Branch</div>
                    </div>
                </Link>

                {/* Settings Section */}
                {user?.role === 'super_admin' ? <Link to={'/settings'}>
                    <div className={`flex justify-center lg:justify-start items-center space-x-4 p-2 rounded-lg transition-all duration-500
                    ${isActive('/settings') ? 'bg-[#016E5B] text-white' : ''}`}>
                        <IoSettingsOutline className="text-xl" />
                        <div className="hidden lg:group-hover:block">Settings</div>
                    </div>
                </Link> : null}


                {/* Logout Section */}
                <div className="flex justify-center lg:justify-start cursor-pointer items-center space-x-4 hover:bg-[#016E5B] hover:text-white p-2 rounded-lg transition-all duration-200 " onClick={handleLogoutClick}>
                    <IoIosLogOut className="text-xl" />
                    <div className="hidden lg:group-hover:block">Logout</div>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            <LogoutConfirmation
                isOpen={showLogoutConfirmation}
                onClose={() => setShowLogoutConfirmation(false)}
                onConfirm={handleLogoutConfirm}
            />
        </div>
    );
};

export default SideNav;
