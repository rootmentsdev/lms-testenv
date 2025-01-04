import Header from "../../components/Header/Header";
import { FaPlus } from "react-icons/fa";
import { CiFilter } from "react-icons/ci";
import { useEffect, useState } from "react";
import baseUrl from "../../api/api";
const EmployeeData = () => {

    const [Data, setData] = useState([]); // State to store fetched data

    useEffect(() => {
        const fetchModules = async () => {
            try {
                const response = await fetch(`${baseUrl.baseUrl}api/usercreate/getAllUser`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                });

                if (!response.ok) { // Check for HTTP errors
                    throw new Error(`Error: ${response.statusText}`);
                }

                const data = await response.json();
                setData(data); // Update state with fetched data
                // console.log(Data);
                // alert(Data.data[0].email)
            } catch (error) {
                console.error("Failed to fetch modules:", error.message);
            }
        };

        fetchModules(); // Invoke the function

    }, []);
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => {
        setIsOpen(prev => !prev);
    };

    return (
        <div className="mb-[70px]">
            <div><Header name='Employee' /></div>
            <div>
                <div className="flex justify-between mt-12">
                    <div className="flex w-56 border-2 justify-evenly items-center py-2 ml-10 cursor-pointer
                    ">
                        <div className="text-[#016E5B]">
                            <FaPlus />
                        </div>
                        <h4 className="text-black">Add New Employee</h4>
                    </div>
                    <div className="relative inline-block text-left w-36 mr-10">
                        <button
                            type="button"
                            className="flex justify-between items-center w-full border-2 py-2 px-4 bg-white text-black rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            onClick={toggleDropdown}
                        >
                            <h4>Filter</h4>
                            <CiFilter className="text-[#016E5B]" />
                        </button>

                        {/* Dropdown Menu */}
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
                    </div>
                </div>
                <div className="overflow-x-auto mx-10 mt-5 flex justify-center text-black">
                    <table className="min-w-full border-2 border-gray-300">
                        <thead>
                            <tr className="bg-[#016E5B] text-white">
                                <th className="px-3 py-1 border-2 border-gray-300">Emp Id</th>
                                <th className="px-3 py-1 border-2 border-gray-300">Name</th>
                                <th className="px-3 py-1 border-2 border-gray-300">Role</th>
                                <th className="px-3 py-1 border-2 border-gray-300">Branch</th>
                                <th className="px-3 py-1 border-2 border-gray-300">Training</th>
                                <th className="px-3 py-1 border-2 border-gray-300">Assessments</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Data?.data?.length > 0 ? (
                                Data?.data?.map((employee, index) => {

                                    return (
                                        <tr key={index} className="border-b hover:bg-gray-100">
                                            <td className="px-3 py-1 h-[45px] border-2 border-gray-300 text-center">#{employee.empID}</td>
                                            <td className="px-3 py-1 border-2 border-gray-300 text-center">{employee.username}</td>
                                            <td className="px-3 py-1 border-2 border-gray-300 text-center">{employee.designation}</td>
                                            <td className="px-3 py-1 border-2 border-gray-300 text-center">{employee.workingBranch}</td>
                                            <td className="px-3 py-1 border-2 border-gray-300 text-center">{employee.training.length}</td>
                                            <td className="px-3 py-1 border-2 border-gray-300 text-center">{employee.assignedAssessments.length || 'N/A'}</td>
                                        </tr>

                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-3">No data available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default EmployeeData;
