// ... other imports remain unchanged
import { useEffect, useState, useMemo } from "react";
import Header from "../../components/Header/Header";
import SideNav from "../../components/SideNav/SideNav";
import { CiFilter } from "react-icons/ci";
import baseUrl from "../../api/api";
import { Link } from "react-router-dom";

const EmployeeData = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterRole, setFilterRole] = useState("");
  const [filterBranch, setFilterBranch] = useState("");
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isBranchOpen, setIsBranchOpen] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem('token');

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

        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
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

  const roles = useMemo(() => [...new Set(data.map(emp => emp.designation))], [data]);
  const branches = useMemo(() => [...new Set(data.map(emp => emp.workingBranch))], [data]);

  const filterData = (role, branch) => {
    const filtered = data.filter(
      employee =>
        (!role || employee.designation === role) &&
        (!branch || employee.workingBranch === branch)
    );
    setFilteredData(filtered);
  };

  const handleRoleChange = (role) => {
    setFilterRole(role);
    filterData(role, filterBranch);
    setIsRoleOpen(false);
  };

  const handleBranchChange = (branch) => {
    setFilterBranch(branch);
    filterData(filterRole, branch);
    setIsBranchOpen(false);
  };

  const exportToCSV = () => {
    const headers = [
      "Emp ID",
      "Name",
      "Role",
      "Branch",
      "Training",
      "Trng. Comp",
      "Trng. Overdue",
      "Assessments",
      "Assmt. Comp",
      "Assmt. Overdue"
    ];

    const rows = filteredData.map(emp => [
      emp.empID,
      emp.username,
      emp.designation,
      emp.workingBranch,
      emp.trainingCount,
      `${emp.passCountTraining}%`,
      emp.Trainingdue,
      emp.assignedAssessmentsCount,
      `${emp.passCountAssessment}%`,
      emp.AssessmentDue
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map(row => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "employee_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mb-[70px] text-[14px]">
      <Header name="Employee" />
      <SideNav />

      <div className="md:ml-[90px] mt-[160px]">
        <div className="flex justify-between items-center me-12 ms-12 mt-16">
          <h1 className="text-[#212121] text-2xl mb-2 font-semibold">Employee Management</h1>

          <div className="flex items-center gap-4">
            {/* Role Dropdown */}
            <div className="relative w-36">
              <button
                className="flex justify-between items-center w-full border-2 py-2 px-4 bg-white text-black rounded-md hover:bg-gray-200 transition-all duration-150"
                onClick={() => setIsRoleOpen(prev => !prev)}
              >
                <span>{filterRole || "Role"}</span>
                <CiFilter className="text-[#016E5B]" />
              </button>
              {isRoleOpen && (
                <div className="absolute right-0 mt-2 w-full bg-white rounded-md shadow-md z-10 max-h-60 overflow-y-auto">
                  <button onClick={() => handleRoleChange("")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">All</button>
                  {roles.map((role, index) => (
                    <button key={index} onClick={() => handleRoleChange(role)} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                      {role}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Branch Dropdown */}
            <div className="relative w-36">
              <button
                className="flex justify-between items-center w-full border-2 py-2 px-4 bg-white text-black rounded-md hover:bg-gray-200 transition-all duration-150"
                onClick={() => setIsBranchOpen(prev => !prev)}
              >
                <span>{filterBranch || "Branch"}</span>
                <CiFilter className="text-[#016E5B]" />
              </button>
              {isBranchOpen && (
                <div className="absolute right-0 mt-2 w-full bg-white rounded-md shadow-md z-10 max-h-60 overflow-y-auto">
                  <button onClick={() => handleBranchChange("")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">All</button>
                  {branches.map((branch, index) => (
                    <button key={index} onClick={() => handleBranchChange(branch)} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                      {branch}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ✅ CSV Download Button (always shown) */}
            <button
              className="bg-[#016E5B] text-white px-4 py-2 rounded-md hover:bg-[#014C3F] transition-all duration-150"
              onClick={exportToCSV}
            >
              Download CSV
            </button>
          </div>
        </div>

        {error && <div className="text-red-500 text-center my-4">{error}</div>}

        <div className="ms-1 overflow-x-auto text-black mt-6">
          <div className="max-h-[70vh] overflow-y-auto">
            <table className="w-full border-2 border-gray-300 text-sm">
              <thead className="sticky top-0 z-20 bg-[#016E5B] text-white">
                <tr>
                  <th className="px-3 py-2 border-2 border-gray-300">Emp ID</th>
                  <th className="px-3 py-2 border-2 border-gray-300">Name</th>
                  <th className="px-3 py-2 border-2 border-gray-300">Role</th>
                  <th className="px-3 py-2 border-2 border-gray-300">Branch</th>
                  <th className="px-3 py-2 border-2 border-gray-300">Training</th>
                  <th className="px-3 py-2 border-2 border-gray-300">Trng. Comp</th>
                  <th className="px-3 py-2 border-2 border-gray-300">Trng. Overdue</th>
                  <th className="px-3 py-2 border-2 border-gray-300">Assessments</th>
                  <th className="px-3 py-2 border-2 border-gray-300">Assmt. Comp</th>
                  <th className="px-3 py-2 border-2 border-gray-300">Assmt. Overdue</th>
                  <th className="px-3 py-2 border-2 border-gray-300">View</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((employee, index) => (
                    <tr key={index} className="border-b hover:bg-gray-100 transition-all">
                      <td className="px-3 py-2 border-2 border-gray-300 text-center">#{employee.empID}</td>
                      <td className="px-3 py-2 border-2 border-gray-300 text-center">{employee.username}</td>
                      <td className="px-3 py-2 border-2 border-gray-300 text-center">{employee.designation}</td>
                      <td className="px-3 py-2 border-2 border-gray-300 text-center">{employee.workingBranch}</td>
                      <td className="px-3 py-2 border-2 border-gray-300 text-center">{employee.trainingCount}</td>
                      <td className="px-3 py-2 border-2 border-gray-300 text-center">{employee.passCountTraining}%</td>
                      <td className="px-3 py-2 border-2 border-gray-300 text-center">{employee.Trainingdue}</td>
                      <td className="px-3 py-2 border-2 border-gray-300 text-center">{employee.assignedAssessmentsCount}</td>
                      <td className="px-3 py-2 border-2 border-gray-300 text-center">{employee.passCountAssessment}%</td>
                      <td className="px-3 py-2 border-2 border-gray-300 text-center">{employee.AssessmentDue}</td>
                      <td className="px-3 py-2 border-2 border-gray-300 text-center">
                        <Link to={`/detailed/${employee.empID}`} className="text-[#016E5B] font-semibold hover:underline">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="text-center py-4">No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};



export default EmployeeData;
