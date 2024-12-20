import { IoGrid } from "react-icons/io5";
import { BsFillPersonVcardFill } from "react-icons/bs";
import { HiOutlineArrowPathRoundedSquare } from "react-icons/hi2";
import { MdOutlineAssessment } from "react-icons/md";
import { VscFileSubmodule } from "react-icons/vsc";
import { IoStorefrontSharp } from "react-icons/io5";
import { IoIosSettings } from "react-icons/io";
import { IoIosLogOut } from "react-icons/io";
import { Link } from "react-router-dom";


const SideNav = () => {
    return (
        <div className="w-[273px] h-full bg-[#F4F4F4] flex flex-col fixed top-0 left-0   ">

            <div className="flex mt-10 ml-5 justify-evenly ">
                <div>
                    <img src="./Rootments.jpg" alt="" />
                </div>
                <div>
                    <div className="text-2xl text-green-700">
                        ROOTMENTS
                    </div>
                    <div className="flex justify-end text-sm">
                        ENTERPRISEE
                    </div>
                </div>

            </div>
            <div className="mt-10 flex flex-col text-md text-black ml-10 space-y-6">
                {/* Dashboard Section */}
                <Link to={'/'}>
                    <div className="flex justify-start cursor-pointer items-center space-x-4 hover:bg-green-500 hover:text-white p-2 rounded-lg transition-all duration-200">
                        <IoGrid className="text-xl" />
                        <div>Dashboard</div>
                    </div>
                </Link>

                {/* Employee Section */}
                <Link to={'/employee'}>
                    <div className="flex justify-start cursor-pointer items-center space-x-4 hover:bg-green-500 hover:text-white p-2 rounded-lg transition-all duration-200">
                        <BsFillPersonVcardFill className="text-xl" />
                        <div>Employee</div>
                    </div>
                </Link>

                {/* Employee Actions Section */}
                <Link to={'/training'}>
                    <div className="flex justify-start cursor-pointer items-center space-x-4 hover:bg-green-500 hover:text-white p-2 rounded-lg transition-all duration-200">
                        <HiOutlineArrowPathRoundedSquare className="text-xl" />
                        <div>Trainings</div>
                    </div>
                </Link>

                {/* Assessments Section */}
                <Link to={'/assessments'}>
                    <div className="flex justify-start cursor-pointer items-center space-x-4 hover:bg-green-500 hover:text-white p-2 rounded-lg transition-all duration-200">
                        <MdOutlineAssessment className="text-xl" />
                        <div>Assessments</div>
                    </div>
                </Link>

                {/* Module Section */}
                <Link to={'/module'}>
                    <div className="flex justify-start cursor-pointer items-center space-x-4 hover:bg-green-500 hover:text-white p-2 rounded-lg transition-all duration-200">
                        <VscFileSubmodule className="text-xl" />
                        <div>Module</div>
                    </div>
                </Link>

                {/* Branch Section */}
                <Link to={'/branch'}>
                    <div className="flex justify-start cursor-pointer items-center space-x-4 hover:bg-green-500 hover:text-white p-2 rounded-lg transition-all duration-200">
                        <IoStorefrontSharp className="text-xl" />
                        <div>Branch</div>
                    </div>
                </Link>

                {/* Settings Section */}
                <Link to={'/settings'}>
                    <div className="flex justify-start cursor-pointer items-center space-x-4 hover:bg-green-500 hover:text-white p-2 rounded-lg transition-all duration-200">
                        <IoIosSettings className="text-xl" />
                        <div>Settings</div>
                    </div>
                </Link>

                {/* Logout Section */}
                <div className="flex justify-start cursor-pointer items-center space-x-4 hover:bg-green-500 hover:text-white p-2 rounded-lg transition-all duration-200">
                    <IoIosLogOut className="text-xl" />
                    <div>Logout</div>
                </div>

            </div>



        </div>

    )
}

export default SideNav