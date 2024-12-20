import Header from "../../components/Header/Header"
import { FaPlus } from "react-icons/fa";
import { CiFilter } from "react-icons/ci";
import { useState } from "react";
import RoundProgressBarAssessment from "../../components/RoundBar/RoundAssessment";

const AssessmentsData = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => {
        setIsOpen(prev => !prev);
    };
    return (
        <div>

            <div className="w-full h-full bg-white">
                <div><Header name='Assessments' /></div>
                <div>

                    <div className="flex mx-10 justify-between mt-10 ">
                        <div className="flex w-56 border-2 justify-evenly items-center py-2 ml-10 cursor-pointer
                         ">
                            <div className="text-green-500">
                                <FaPlus />
                            </div>
                            <h4 className="text-black">Create New Assessment</h4>
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

                    <RoundProgressBarAssessment initialProgress='73' title='Assessment' Module='Completion Rate : 86%' complete='Average score achieved : 73%' />
                    <RoundProgressBarAssessment initialProgress='74' title='Assessment' Module='Completion Rate : 86%' complete='Average score achieved : 74%' />
                    <RoundProgressBarAssessment initialProgress='990' title='Assessment' Module='Completion Rate : 86%' complete='Average score achieved : 90%' />
                    <RoundProgressBarAssessment initialProgress='100' title='Assessment' Module='Completion Rate : 86%' complete='Average score achieved : 100%' />
                    <RoundProgressBarAssessment initialProgress='46' title='Assessment' Module='Completion Rate : 86%' complete='Average score achieved : 46%' />
                    <RoundProgressBarAssessment initialProgress='26' title='Assessment' Module='Completion Rate : 86%' complete='Average score achieved : 26%' />
                    <RoundProgressBarAssessment initialProgress='56' title='Assessment' Module='Completion Rate : 86%' complete='Average score achieved : 56%' />

                </div>
            </div>
        </div>
    )
}

export default AssessmentsData