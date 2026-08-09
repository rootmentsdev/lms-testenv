



// import ModileNav from "../../components/SideNav/ModileNav";

import { BsFillSendCheckFill } from "react-icons/bs";

import { useEffect, useState, useMemo } from "react";
import SideNav from "../../components/SideNav/SideNav";
import { CiFilter } from "react-icons/ci";
import baseUrl, { formatStoreDisplayName } from "../../api/api";
import { BsSend } from "react-icons/bs";
import { toast } from "react-toastify";

const AssessmentOverDuedata = () => {
  const [data, setData] = useState([]); // All employee data
  const [filteredData, setFilteredData] = useState([]); // Filtered employee data
  const [filterRole, setFilterRole] = useState(""); // Selected role filter
  const [filterBranch, setFilterBranch] = useState(""); // Selected branch filter
  const [isRoleOpen, setIsRoleOpen] = useState(false); // Role dropdown state
  const [isBranchOpen, setIsBranchOpen] = useState(false); // Branch dropdown state
  const [error, setError] = useState(""); // Error state
  const [sendStatus, setSendStatus] = useState({}); // Track send status for each employee
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(`${baseUrl.baseUrl}api/admin/overdue/Assessment`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`,

          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`${response.statusText}`);
        }
        const result = await response.json();
        const formattedData = (result.data || []).map(emp => ({
          ...emp,
          workingBranch: emp.workingBranch ? (emp.workingBranch.split(',').length > 5 ? "All Stores" : emp.workingBranch) : ""
        }));
        setData(formattedData);
        setFilteredData(formattedData);
      } catch (error) {
        setError("Failed to fetch employee data. Please try again later.");
      }
    };

    fetchEmployees();
  }, [error, token]);

  const roles = useMemo(() => [...new Set(data.map(emp => emp.role))], [data]);
  const branches = useMemo(() => [...new Set(data.map(emp => emp.workingBranch))], [data]);

  const filterData = (role, branch) => {
    const filtered = data.filter(
      employee =>
        (!role || employee.role === role) &&
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

  const HandleSend = async (empID) => {
    // Update send status for the specific employee
    setSendStatus(prev => ({ ...prev, [empID]: true }));
    try {

      const request = await fetch(`${baseUrl.baseUrl}api/admin/overdue/assessment/send/${empID}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,

        }

      })
      const resp = await request.json()
      toast.success(resp.message, {
        icon: <BsFillSendCheckFill className="text-green-500" size={24} />
      });
    } catch (error) {
      throw new Error(error)
    }

  };

  return (
    <div className="bg-white h-[100] lg:mb-[90px]">
      <SideNav />
      <div className="md:ml-[120px]">
        <div className="flex justify-end mb-5 mt-20">
          <div className="flex gap-4 mt-10">
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
                <h4>{filterBranch ? formatStoreDisplayName(filterBranch) : "Branch"}</h4>
                <CiFilter className="text-[#016E5B]" />
              </button>
              {isBranchOpen && (
                <div className="absolute right-0 mt-2 w-full bg-white rounded-md shadow-lg">
                  <button onClick={() => handleBranchChange("")} className="block w-full py-2 text-sm text-gray-700 hover:bg-gray-100">
                    All
                  </button>
                  {branches.map((branch, index) => (
                    <button key={index} onClick={() => handleBranchChange(branch)} className="block w-full py-2 text-sm text-gray-700 hover:bg-gray-100">
                      {formatStoreDisplayName(branch)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {/* {error && <div className="text-red-500 text-center mb-4">{error} OR No data</div>} */}

        {/* Employee Table */}
        <div className="mt-2 text-black overflow-x-auto w-full">
          <table className="min-w-full bg-white border-2 border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-3 py-1 border-2 border-gray-300">Emp ID</th>
                <th className="px-3 py-1 border-2 border-gray-300">Employee Name</th>
                <th className="px-3 py-1 border-2 border-gray-300">Designation</th>
                <th className="px-3 py-1 border-2 border-gray-300">Branch Name</th>
                <th className="px-3 py-1 border-2 border-gray-300">Overdue Module Name</th>
                <th className="px-3 py-1 border-2 border-gray-300">Remind</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((employee, index) => (
                  <tr key={index} className="border-b hover:bg-gray-100">
                    <td className="px-3 py-1 border-2 border-gray-300 text-center">#{employee.empID}</td>
                    <td className="px-3 py-1 border-2 border-gray-300 text-center">{employee.userName}</td>
                    <td className="px-3 py-1 border-2 border-gray-300 text-center">{employee.role}</td>
                    <td className="px-3 py-1 border-2 border-gray-300 text-center">{formatStoreDisplayName(employee.workingBranch)}</td>
                    <td className="px-3 py-1 border-2 border-gray-300 text-center">
                      {employee.overdueAssessments?.length > 0 ? (
                        employee.overdueAssessments.map((assessment, idx) => (
                          <div key={idx} className="flex flex-col">
                            <div className="text-left">
                              {assessment.assessmentId.title} (Due: {assessment.deadline ? new Date(assessment.deadline).toLocaleDateString() : 'No deadline'})
                            </div>
                            {idx < employee.overdueAssessments.length - 1 && (
                              <div className="border-t border-black w-full my-2"></div>
                            )}
                          </div>
                        ))
                      ) : (
                        "No Overdue Assessments"
                      )}
                    </td>
                    <td className="px-3 py-1 border-2 border-gray-300 text-center">
                      {sendStatus[employee.empID] ? (
                        <span className="flex justify-center items-center gap-2 text-[#016E5B]">
                          OK <BsFillSendCheckFill />
                        </span>
                      ) : (
                        <span
                          className="flex justify-center items-center gap-2 cursor-pointer text-[#016E5B]"
                          onClick={() => HandleSend(employee.empID)}
                        >
                          Send <BsSend />
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-3">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="h-5">

        </div>
      </div>
    </div>
  );
};

export default AssessmentOverDuedata;
