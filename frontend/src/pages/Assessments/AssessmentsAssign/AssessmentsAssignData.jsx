import { Link, useParams } from "react-router-dom";
import Header from "../../../components/Header/Header";
import SideNav from "../../../components/SideNav/SideNav";
import { useEffect, useState } from "react";
import baseUrl from "../../../api/api";
import { FaPlus } from "react-icons/fa";
import { CiFilter } from "react-icons/ci";

const AssessmentsAssignData = () => {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [filteredData, setFilteredData] = useState([]); // State for filtered data
  const [filterRole, setFilterRole] = useState(""); // State for selected role filter
  const [filterBranch, setFilterBranch] = useState(""); // State for selected branch filter
  const [roles, setRoles] = useState([]); // Unique roles
  const [branches, setBranches] = useState([]); // Unique branches
  const [isOpen, setIsOpen] = useState(false); // Dropdown toggle for role filter
  const [isBranchOpen, setIsBranchOpen] = useState(false); // Dropdown toggle for branch filter

  useEffect(() => {
    const fetchData = async () => {
      try {
        const request = await fetch(`${baseUrl.baseUrl}api/user/get/assessment/details/${id}`);
        const response = await request.json();

        if (response?.data?.users) {
          setData(response.data.users);
          setFilteredData(response.data.users); // Set the initial filtered data

          // Extract unique roles and branches for filtering
          const uniqueRoles = [...new Set(response.data.users.map(user => user.designation))];
          const uniqueBranches = [...new Set(response.data.users.map(user => user.workingBranch))];
          setRoles(uniqueRoles);
          setBranches(uniqueBranches);
        } else {
          setError("No assessment details found.");
        }
      } catch (error) {
        setError("An error occurred while fetching data.", error);
      }
    };

    fetchData();
  }, [id]);

  const handleFilterChange = (role) => {
    setIsOpen(prev => !prev);
    setFilterRole(role);
    filterData(role, filterBranch); // Apply the filter with the current role and branch
  };

  const handleBranchFilterChange = (branch) => {
    setIsBranchOpen(prev => !prev);
    setFilterBranch(branch);
    filterData(filterRole, branch); // Apply the filter with the current role and branch
  };

  const filterData = (role, branch) => {
    let filtered = data;

    if (role) {
      filtered = filtered.filter(user => user.designation === role);
    }
    if (branch) {
      filtered = filtered.filter(user => user.workingBranch === branch);
    }

    setFilteredData(filtered); // Update the filtered data
  };

  const toggleDropdown = () => setIsOpen(!isOpen);
  const toggleBranchDropdown = () => setIsBranchOpen(!isBranchOpen);

  // Sort filteredData by score in ascending order (high scores last)
  const sortedData = [...filteredData].sort((a, b) => {
    const scoreA = a.assignedAssessments?.[0]?.complete || 0;
    const scoreB = b.assignedAssessments?.[0]?.complete || 0;
    return scoreA - scoreB; // Ascending order
  });

  return (
    <div className="w-full h-full bg-white text-[#016E5B]">
      <Header name="Assessments Details" />
      <SideNav />
      <div className="md:ml-[100px] mt-[150px]">
        <div className="flex justify-between mx-10">
          <Link to={'/assign/Assessment'}>
            <div className="flex w-56 border-2 justify-evenly items-center py-2 ml-10 cursor-pointer">
              <div className="text-[#016E5B]"><FaPlus /></div>
              <h4 className="text-black">Assign Assessment</h4>
            </div>
          </Link>

          {/* Role Filter Dropdown */}
          <div className="flex gap-5">
            <div className="relative inline-block text-left w-36">
              <button
                type="button"
                className="flex justify-between items-center w-full border-2 py-2 px-4 bg-white text-black rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                onClick={toggleDropdown}
              >
                <h4>{filterRole ? filterRole : "Role"}</h4>
                <CiFilter className="text-[#016E5B]" />
              </button>

              {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <button onClick={() => handleFilterChange("")} className="block py-2 text-sm text-gray-700 w-full hover:bg-gray-100">All</button>
                    {roles.map((role, index) => (
                      <button key={index} onClick={() => handleFilterChange(role)} className="block w-full py-2 text-sm text-gray-700 hover:bg-gray-100">{role}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Branch Filter Dropdown */}
            <div className="relative inline-block text-left w-36 mr-10">
              <button
                type="button"
                className="flex justify-between items-center w-full border-2 py-2 px-4 bg-white text-black rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                onClick={toggleBranchDropdown}
              >
                <h4>{filterBranch ? filterBranch : "Branch"}</h4>
                <CiFilter className="text-[#016E5B]" />
              </button>

              {isBranchOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
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

        {/* Table displaying filtered and sorted data */}
        <div className="overflow-x-auto md:mx-10 mt-5 flex justify-center">
          {error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : sortedData.length === 0 ? (
            <p className="text-gray-500 text-center">No data available.</p>
          ) : (
            <div className="overflow-x-auto max-w-full mx-2 mt-5">
              <table className="min-w-max w-full lg:w-[1200px] border-2 border-gray-300">
                <thead>
                  <tr className="bg-[#016E5B] text-white">
                    <th scope="col" className="px-3 py-1 border-2 border-gray-300">EmpID</th>
                    <th scope="col" className="px-3 py-1 border-2 border-gray-300">Name</th>
                    <th scope="col" className="px-3 py-1 border-2 border-gray-300">Designation</th>
                    <th scope="col" className="px-3 py-1 border-2 border-gray-300">Branch</th>
                    <th scope="col" className="px-3 py-1 border-2 border-gray-300">Due Date</th>
                    <th scope="col" className="px-3 py-1 border-2 border-gray-300">Status</th>
                    <th scope="col" className="px-3 py-1 border-2 border-gray-300">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((user, index) => {
                    const assignment = user.assignedAssessments?.[0];
                    return (
                      <tr key={index} className="border-b hover:bg-gray-100 text-black">
                        <td className="px-3 py-2 border-2 border-gray-300 text-center">{user.empID}</td>
                        <td className="px-3 py-1 border-2 border-gray-300 text-center">{user.username}</td>
                        <td className="px-3 py-1 border-2 border-gray-300 text-center">{user.designation}</td>
                        <td className="px-3 py-1 border-2 border-gray-300 text-center">{user.workingBranch}</td>
                        <td className="px-3 py-1 border-2 border-gray-300 text-center">
                          {assignment ? new Date(assignment.deadline).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="px-3 py-1 border-2 border-gray-300 text-center">
                          {assignment ? assignment.status : "pending"}
                        </td>
                        <td className="px-3 py-1 border-2 border-gray-300 text-center">
                          {assignment ? Math.round(assignment.complete) : "N/A"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentsAssignData;
