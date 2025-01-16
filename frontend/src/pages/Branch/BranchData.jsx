import { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import { FaPlus } from "react-icons/fa";
// import { CiFilter } from "react-icons/ci";
import SideNav from "../../components/SideNav/SideNav";
import baseUrl from "../../api/api";
import { Link } from "react-router-dom";

const BranchData = () => {
    // const [isOpen, setIsOpen] = useState(false);
    const [branch, setBranch] = useState([]);

    // const toggleDropdown = () => {
    //     setIsOpen(prev => !prev);
    // };

    useEffect(() => {
        const FetchUser = async () => {
            try {
                const request = await fetch(baseUrl.baseUrl + 'api/usercreate/getBranch');
                const response = await request.json(); // Await the JSON response

                if (response.data) {
                    setBranch(response.data); // Set the branch data state
                }

            } catch (error) {
                console.error("Error fetching branches:", error); // Log the error properly
            }
        };

        FetchUser(); // Call the fetch function on component mount
    }, []); // Add an empty dependency array to ensure it runs only once on mount

    return (
        <div className="mb-[70px]">
            <div><Header name='Branch ' /></div>
            <SideNav />
            <div className="md:ml-[90px] mt-[150px]">
                <div className="flex justify-between mt-12">
                    <Link to={'/Addbranch'} className="flex w-56 border-2 justify-evenly items-center py-2 ml-10 cursor-pointer">
                        <div className="text-[#016E5B]">
                            <FaPlus />
                        </div>
                        <h4 className="text-black">Add New Branch</h4>
                    </Link>
                    {/* <div className="relative inline-block text-left w-36 mr-10">
                        <button
                            type="button"
                            className="flex justify-between items-center w-full border-2 py-2 px-4 bg-white text-black rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#016E5B]"
                            onClick={toggleDropdown}
                        >
                            <h4>Filter</h4>
                            <CiFilter className="text-[#016E5B]" />
                        </button>

                      
                        {isOpen && (
                            <div
                                className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
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
                    </div> */}
                </div>
                <div className="overflow-x-auto mx-10 mt-5 flex justify-center">
                    <table className="min-w-full border-2 border-gray-300">
                        <thead>
                            <tr className="bg-[#016E5B] text-white">
                                <th className="px-3 py-1  border-2 border-gray-300">LocCode</th>
                                <th className="px-3 py-1 border-2 border-gray-300">Name</th>
                                <th className="px-3 py-1 border-2 border-gray-300">No of emp</th>
                                <th className="px-3 py-1 border-2 border-gray-300">No of Training </th>
                                <th className="px-3 py-1 border-2 border-gray-300">No of Assessment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {branch?.map((branch, index) => (
                                <tr key={index} className="border-b hover:bg-gray-100 text-black">
                                    <td className="px-3 py-2 border-2 border-gray-300 text-center">{branch?.locCode}</td>
                                    <td className="px-3 py-1 border-2 border-gray-300 text-center">{branch.workingBranch}</td>
                                    <td className="px-3 py-1 border-2 border-gray-300 text-center">{branch.userCount}</td>
                                    <td className="px-3 py-1 border-2 border-gray-300 text-center">{branch.totalTrainingCount}</td>
                                    <td className="px-3 py-1 border-2 border-gray-300 text-center">{branch.totalAssessmentCount}</td>
                                </tr>

                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BranchData;
