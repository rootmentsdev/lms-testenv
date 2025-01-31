import { useEffect, useState, useMemo } from "react";
import Header from "../../components/Header/Header";
import SideNav from "../../components/SideNav/SideNav";
import { CiFilter } from "react-icons/ci";
import baseUrl from "../../api/api";
import { Link } from "react-router-dom";

const EmployeeData = () => {
    const [data, setData] = useState([]); // All employee data
    const [filteredData, setFilteredData] = useState([]); // Filtered employee data
    const [filterRole, setFilterRole] = useState(""); // Selected role filter
    const [filterBranch, setFilterBranch] = useState(""); // Selected branch filter
    const [isRoleOpen, setIsRoleOpen] = useState(false); // Role dropdown state
    const [isBranchOpen, setIsBranchOpen] = useState(false); // Branch dropdown state
    const [error, setError] = useState(""); // Error state
    const token = localStorage.getItem('token');


    // Fetch employee data on component mount
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await fetch(`${baseUrl.baseUrl}api/usercreate/getAllUser`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${token}`,
                    },
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                const result = await response.json();
                setData(result.data);
                setFilteredData(result.data);
            } catch (error) {
                console.error("Failed to fetch employees:", error.message);
                setError("Failed to fetch employee data. Please try again later.");
            }
        };

        fetchEmployees();
    }, []);

    // Extract unique roles and branches using useMemo
    const roles = useMemo(() => [...new Set(data.map(emp => emp.designation))], [data]);
    const branches = useMemo(() => [...new Set(data.map(emp => emp.workingBranch))], [data]);

    // Filter employee data based on selected role and branch
    const filterData = (role, branch) => {
        const filtered = data.filter(
            employee =>
                (!role || employee.designation === role) &&
                (!branch || employee.workingBranch === branch)
        );
        setFilteredData(filtered);
    };

    // Handle role filter change
    const handleRoleChange = (role) => {
        setFilterRole(role);
        filterData(role, filterBranch);
        setIsRoleOpen(false);
    };

    // Handle branch filter change
    const handleBranchChange = (branch) => {
        setFilterBranch(branch);
        filterData(filterRole, branch);
        setIsBranchOpen(false);
    };

    return (
        <div className="mb-[70px]">
            <Header name="Employee" />
            <SideNav />
            <div className="md:ml-[90px] mt-[150px]">
                <div className="flex justify-end mb-5 mt-12">
                    <div className="flex gap-4">
                        {/* Role Dropdown */}
                        <div className="relative inline-block text-left w-36">
                            <button
                                type="button"
                                className="flex justify-between items-center w-full border-2 py-2 px-4 bg-white text-black rounded-md hover:bg-gray-200"
                                onClick={() => setIsRoleOpen(prev => !prev)}
                            >
                                <h4>{filterRole || "Role"}</h4>
                                <CiFilter className="text-[#016E5B]" />
                            </button>
                            {isRoleOpen && (
                                <div className="absolute right-0 mt-2 w-full bg-white rounded-md shadow-lg">
                                    <button onClick={() => handleRoleChange("")} className="block w-full py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        All
                                    </button>
                                    {roles.map((role, index) => (
                                        <button key={index} onClick={() => handleRoleChange(role)} className="block w-full py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            {role}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Branch Dropdown */}
                        <div className="relative inline-block text-left w-36 mx-5">
                            <button
                                type="button"
                                className="flex justify-between items-center w-full border-2 py-2 px-4 bg-white text-black rounded-md hover:bg-gray-200"
                                onClick={() => setIsBranchOpen(prev => !prev)}
                            >
                                <h4>{filterBranch || "Branch"}</h4>
                                <CiFilter className="text-[#016E5B]" />
                            </button>
                            {isBranchOpen && (
                                <div className="absolute right-0 mt-2 w-full bg-white rounded-md shadow-lg">
                                    <button onClick={() => handleBranchChange("")} className="block w-full py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        All
                                    </button>
                                    {branches.map((branch, index) => (
                                        <button key={index} onClick={() => handleBranchChange(branch)} className="block w-full py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            {branch}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && <div className="text-red-500 text-center mb-4">{error}</div>}

                {/* Employee Table */}
                <div className="mx-10 overflow-x-auto text-black">
                    <table className="w-full border-2 border-gray-300">
                        <thead>
                            <tr className="bg-[#016E5B] text-white">
                                <th className="px-3 py-1 border-2 border-gray-300">Emp ID</th>
                                <th className="px-3 py-1 border-2 border-gray-300">Name</th>
                                <th className="px-3 py-1 border-2 border-gray-300">Role</th>
                                <th className="px-3 py-1 border-2 border-gray-300">Branch</th>
                                <th className="px-3 py-1 border-2 border-gray-300">Training</th>
                                <th className="px-3 py-1 border-2 border-gray-300">Trng. Comp</th>
                                <th className="px-3 py-1 border-2 border-gray-300">Trng. Overdue</th>
                                <th className="px-3 py-1 border-2 border-gray-300">Assessments</th>
                                <th className="px-3 py-1 border-2 border-gray-300">Assmt. Comp</th>
                                <th className="px-3 py-1 border-2 border-gray-300">Assmt. Overdue</th>
                                <th className="px-3 py-1 border-2 border-gray-300">View</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? (
                                filteredData.map((employee, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-100">
                                        <td className="px-3 py-1 border-2 border-gray-300 text-center">#{employee.empID}</td>
                                        <td className="px-3 py-1 border-2 border-gray-300 text-center">{employee.username}</td>
                                        <td className="px-3 py-1 border-2 border-gray-300 text-center">{employee.designation}</td>
                                        <td className="px-3 py-1 border-2 border-gray-300 text-center">{employee.workingBranch}</td>
                                        <td className="px-3 py-1 border-2 border-gray-300 text-center">{employee.trainingCount}</td>
                                        <td className="px-3 py-1 border-2 border-gray-300 text-center">{employee.passCountTraining}%</td>
                                        <td className="px-3 py-1 border-2 border-gray-300 text-center">{employee.Trainingdue}</td>
                                        <td className="px-3 py-1 border-2 border-gray-300 text-center">{employee.assignedAssessmentsCount}</td>
                                        <td className="px-3 py-1 border-2 border-gray-300 text-center">{employee.passCountAssessment}%</td>
                                        <td className="px-3 py-1 border-2 border-gray-300 text-center">{employee.AssessmentDue}</td>
                                        <Link to={`/detailed/${employee.empID}`}>                                        <td className="px-3 py-1 border-2 border-gray-300 text-center">View</td>
                                        </Link>
                                    </tr>
                                ))
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
