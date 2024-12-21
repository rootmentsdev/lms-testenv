import { Link } from "react-router-dom"
import RoundProgressBar from "../../components/RoundBar/RoundBar"
import Header from "../../components/Header/Header"
import { FaPlus } from "react-icons/fa";
import { CiFilter } from "react-icons/ci";
import { useState } from "react";


const AssignedTrainingsData = () => {
    const [isOpen, setIsOpen] = useState(false);
    //  /
    const toggleDropdown = () => {
        setIsOpen(prev => !prev);
    };
    return (
        <div className="w-full h-full bg-white">
            <div><Header name='Assigned Training' /></div>
            <div>
                <Link to={'/Alltraining'}>
                    <div className="flex justify-end mr-20">
                        <div className="flex w-56 mt-5 border-2 justify-center items-center py-2 ml-10 cursor-pointer
                                      ">

                            <h4 className="text-black">Show All Training</h4>
                        </div>
                    </div>
                </Link>
                <div className="flex text-black ml-10 gap-5 text-xl w-full">
                    <Link to='/training'>
                        <h4 className="cursor-pointer">Mandatory Trainings</h4>
                    </Link>

                    <h4 className="border-b-[3px] border-green-600 text-green-600 " >Assigned Trainings</h4>

                </div>
                <hr className="mx-10 mt-[-1px] border-green-600 " />


                <div className="flex mx-10 justify-between mt-10 ">
                    <div className="flex w-56 border-2 justify-evenly items-center py-2 ml-10 cursor-pointer
                                      ">
                        <div className="text-green-500">
                            <FaPlus />
                        </div>
                        <h4 className="text-black">Create new Training</h4>
                    </div>
                    <div className="relative inline-block text-left w-36 mr-10">
                        <button
                            type="button"
                            className="flex justify-between items-center w-full border-2 py-2 px-4 bg-white text-black rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            onClick={toggleDropdown}
                        >
                            <h4>Filter</h4>
                            <CiFilter className="text-green-500" />
                        </button>

                        {/* Dropdown Menu */}
                        {isOpen && (
                            <div
                                className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                                role="menu"
                                aria-orientation="vertical"
                            >
                                <div className="py-1">
                                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Option 1</a>
                                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Option 2</a>
                                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Option 3</a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-10 ml-10 flex flex-wrap gap-3">
                <RoundProgressBar initialProgress='40' title='Training 1' Module='No. of Modules : 12' duration='Duration : 01 : 56 hr' complete='Completion Rate : 40%' />
                <RoundProgressBar initialProgress='80' title='Training 2' Module='No. of Modules : 12' duration='Duration : 01 : 56 hr' complete='Completion Rate : 80%' />
                <RoundProgressBar initialProgress='90' title='Training 3' Module='No. of Modules : 12' duration='Duration : 01 : 56 hr' complete='Completion Rate : 90%' />
                <RoundProgressBar initialProgress='20' title='Training 4' Module='No. of Modules : 12' duration='Duration : 01 : 56 hr' complete='Completion Rate : 20%' />
            </div>
        </div>
    )
}

export default AssignedTrainingsData