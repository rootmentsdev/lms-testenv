import Header from "../../components/Header/Header";
import { FaPlus } from "react-icons/fa";
import { CiFilter } from "react-icons/ci";
import { useEffect, useState } from "react";
import baseUrl from "../../api/api";
import SideNav from "../../components/SideNav/SideNav";

const EmployeeData = () => {

    const [Data, setData] = useState([]); // State to store fetched data
    const [filteredData, setFilteredData] = useState([]); // State for filtered data
    const [filterRole, setFilterRole] = useState(""); // State for selected role filter
    const [filterBranch, setFilterBranch] = useState(""); // State for selected branch filter
    const [roles, setRoles] = useState([]); // Unique roles
    const [branches, setBranches] = useState([]); // Unique branches

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
                setFilteredData(data.data); // Initialize filtered data

                // Extract unique roles and branches
                const uniqueRoles = [...new Set(data.data.map(emp => emp.designation))];
                const uniqueBranches = [...new Set(data.data.map(emp => emp.workingBranch))];
                setRoles(uniqueRoles);
                setBranches(uniqueBranches);

            } catch (error) {
                console.error("Failed to fetch modules:", error.message);
            }
        };

        fetchModules(); // Invoke the function
    }, []);

    const [isOpen, setIsOpen] = useState(false);
    const [isBranchOpen, setIsBranchOpen] = useState(false);

    const toggleDropdown = () => {
        setIsOpen(prev => !prev);
    };

    const toggleBranchDropdown = () => {
        setIsBranchOpen(prev => !prev);
    };

    // Filter handler
    const handleFilterChange = (role) => {
        setFilterRole(role);
        filterData(role, filterBranch);
        setIsOpen(false); // Close dropdown after selection
    };

    const handleBranchFilterChange = (branch) => {
        setFilterBranch(branch);
        filterData(filterRole, branch);
        setIsBranchOpen(false); // Close dropdown after selection
    };

    const filterData = (role, branch) => {
        let filtered = Data.data;
        if (role) {
            filtered = filtered.filter(employee => employee.designation === role);
        }
        if (branch) {
            filtered = filtered.filter(employee => employee.workingBranch === branch);
        }
        setFilteredData(filtered);
    };

    return (
        <div className="mb-[70px]">
            <div><Header name='Employee' /></div>
            <SideNav />
            <div className="md:ml-[90px] mt-[150px]">
                <div className="flex justify-between mt-12">
                    <div className="flex w-56 border-2 justify-evenly items-center py-2 ml-10 mb-5 cursor-pointer
                    ">
                        <div className="text-[#016E5B]">
                            <FaPlus />
                        </div>
                        <h4 className="text-black">Add New Employee</h4>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative inline-block text-left w-36">
                            <button
                                type="button"
                                className="flex justify-between items-center w-full border-2 py-2 px-4 bg-white text-black rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                onClick={toggleDropdown}
                            >
                                <h4>{filterRole ? filterRole : "Role"}</h4>
                                <CiFilter className="text-[#016E5B]" />
                            </button>

                            {/* Role Dropdown Menu */}
                            {isOpen && (
                                <div
                                    className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                                    role="menu"
                                    aria-orientation="vertical"
                                >
                                    <div className="py-1">
                                        <button onClick={() => handleFilterChange("")} className="block  py-2 text-sm text-gray-700 w-full hover:bg-gray-100">All</button>
                                        {roles.map((role, index) => (
                                            <button key={index} onClick={() => handleFilterChange(role)} className="block w-full py-2 text-sm text-gray-700 hover:bg-gray-100">{role}</button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative inline-block text-left w-36 mr-10">
                            <button
                                type="button"
                                className="flex justify-between items-center w-full  border-2 py-2 px-4 bg-white text-black rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                onClick={toggleBranchDropdown}
                            >
                                <h4>{filterBranch ? filterBranch : "Branch"}</h4>
                                <CiFilter className="text-[#016E5B]" />
                            </button>

                            {/* Branch Dropdown Menu */}
                            {isBranchOpen && (
                                <div
                                    className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                                    role="menu"
                                    aria-orientation="vertical"
                                >
                                    <div className="py-1 cursor-pointer">
                                        <button onClick={() => handleBranchFilterChange("")} className="block w-full py-2 text-sm text-gray-700 hover:bg-gray-100">All</button>
                                        {branches.map((branch, index) => (
                                            <button key={index} onClick={() => handleBranchFilterChange(branch)} className="block w-full py-2 text-sm text-gray-700 hover:bg-gray-100">{branch}</button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="mx-10 overflow-x-auto text-black">
                    <table className="w-full border-2 border-gray-300">
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
                            {filteredData?.length > 0 ? (
                                filteredData.map((employee, index) => {
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
                                    <td colSpan="6" className="text-center py-3">No data available</td>
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
