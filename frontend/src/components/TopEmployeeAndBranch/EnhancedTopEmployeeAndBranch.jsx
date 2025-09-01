import { useEffect, useState } from "react";
import baseUrl from "../../api/api";
import { BiSortAlt2, BiFilterAlt } from "react-icons/bi";
import { useSelector } from "react-redux";

const EnhancedTopEmployeeAndBranch = () => {
  const [allData, setAllData] = useState({});
  const [view, setView] = useState("employees"); // "employees" or "branches"
  const [topData, setTopData] = useState("top"); // "top" or "last"
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false); // Toggle between top 3 and all
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBranch, setFilterBranch] = useState("");
  const token = localStorage.getItem("token");
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use the new comprehensive API endpoint
        const response = await fetch(
          `${baseUrl.baseUrl}api/admin/get/allUsersAndBranches`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        setAllData(result.data || {});
        console.log("Enhanced data:", result.data);
      } catch (error) {
        console.error("Failed to fetch enhanced data:", error.message);
        // Fallback to original API if enhanced fails
        try {
          const fallbackResponse = await fetch(
            `${baseUrl.baseUrl}api/admin/get/bestThreeUser`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              credentials: "include",
            }
          );
          
          if (fallbackResponse.ok) {
            const fallbackResult = await fallbackResponse.json();
            setAllData(fallbackResult.data || {});
            console.log("Fallback data:", fallbackResult.data);
          }
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleTopDataToggle = (type) => setTopData(type);
  const handleViewToggle = (type) => setView(type);
  const handleShowAllToggle = () => setShowAll(!showAll);

  // Filter and sort data
  const getFilteredData = () => {
    let data = [];
    
    if (view === "employees") {
      data = allData.allUsers || allData.topUsers || [];
    } else {
      data = allData.allBranches || allData.topBranches || [];
    }

    // Apply search filter
    if (searchTerm) {
      data = data.filter(item => 
        item.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.branch?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.locCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply branch filter
    if (filterBranch) {
      data = data.filter(item => 
        item.branch === filterBranch || item.locCode === filterBranch
      );
    }

    // Sort data
    if (view === "employees") {
      data = data.sort((a, b) => {
        if (topData === "top") {
          return b.trainingProgress - a.trainingProgress;
        } else {
          return a.trainingProgress - b.trainingProgress;
        }
      });
    } else {
      data = data.sort((a, b) => {
        if (topData === "top") {
          return b.averageTrainingProgress - a.averageTrainingProgress;
        } else {
          return a.averageTrainingProgress - b.averageTrainingProgress;
        }
      });
    }

    // Limit to top 3 if not showing all
    if (!showAll) {
      data = data.slice(0, 3);
    }

    return data;
  };

  // Render employees with enhanced display
  const renderEmployees = () => {
    const users = getFilteredData();

    if (!users || users.length === 0) return <p>No data available</p>;

    return (
      <div className="space-y-3">
        {users.map((emp, index) => (
          <div key={index} className="flex items-center bg-gray-100 p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div
              className={`flex items-center justify-center w-12 h-12 ${
                index + 1 === 1
                  ? "bg-green-500"
                  : index + 1 === 2
                  ? "bg-yellow-500"
                  : index + 1 === 3
                  ? "bg-orange-500"
                  : "bg-blue-500"
              } text-white font-bold text-lg rounded-full`}
            >
              {index + 1}
            </div>
            <div className="ml-4 flex-1">
              <p className="font-semibold text-gray-800">{emp.username || "No Name"}</p>
              <p className="text-gray-600 text-sm">{emp.branch || emp.locCode}</p>
              {emp.role && <p className="text-gray-500 text-xs">{emp.role}</p>}
            </div>
            <div className="text-right">
              <div className="mb-1">
                <p className="font-bold text-green-600">
                  {Math.round(emp.trainingProgress || 0)}%{" "}
                  <span className="text-gray-500 text-sm">Training</span>
                </p>
                {emp.totalTrainings > 0 && (
                  <p className="text-xs text-gray-500">
                    {emp.completedTrainings || 0}/{emp.totalTrainings}
                  </p>
                )}
              </div>
              <div>
                <p className="font-bold text-blue-600">
                  {Math.round(emp.assessmentProgress || 0)}%{" "}
                  <span className="text-gray-500 text-sm">Assessment</span>
                </p>
                {emp.totalAssessments > 0 && (
                  <p className="text-xs text-gray-500">
                    {emp.completedAssessments || 0}/{emp.totalAssessments}
                  </p>
                )}
              </div>
              {emp.totalModules > 0 && (
                <div className="mt-1">
                  <p className="text-xs text-gray-600">
                    Modules: {emp.completedModules || 0}/{emp.totalModules}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render branches with enhanced display
  const renderBranches = () => {
    const branches = getFilteredData();

    if (!branches || branches.length === 0) return <p>No data available</p>;

    return (
      <div className="space-y-3">
        {branches.map((branch, index) => (
          <div key={index} className="flex items-center bg-gray-100 p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div
              className={`flex items-center justify-center w-12 h-12 ${
                index + 1 === 1
                  ? "bg-green-500"
                  : index + 1 === 2
                  ? "bg-yellow-500"
                  : index + 1 === 3
                  ? "bg-orange-500"
                  : "bg-blue-500"
              } text-white font-bold text-lg rounded-full`}
            >
              {index + 1}
            </div>
            <div className="ml-4 flex-1">
              <p className="font-semibold text-gray-800">{branch.branch || branch.locCode}</p>
              <p className="text-gray-600 text-sm">Location: {branch.locCode}</p>
              <p className="text-gray-500 text-xs">{branch.userCount || 0} users</p>
            </div>
            <div className="text-right">
              <div className="mb-1">
                <p className="font-bold text-green-600">
                  {Math.round(branch.averageTrainingProgress || 0)}%{" "}
                  <span className="text-gray-500 text-sm">Training</span>
                </p>
              </div>
              <div>
                <p className="font-bold text-blue-600">
                  {Math.round(branch.averageAssessmentProgress || 0)}%{" "}
                  <span className="text-gray-500 text-sm">Assessment</span>
                </p>
              </div>
              {branch.averageModuleProgress > 0 && (
                <div className="mt-1">
                  <p className="text-xs text-gray-600">
                    Modules: {Math.round(branch.averageModuleProgress || 0)}%
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Get unique branches for filter dropdown
  const getUniqueBranches = () => {
    const data = allData.allUsers || allData.topUsers || [];
    const branches = [...new Set(data.map(item => item.branch || item.locCode).filter(Boolean))];
    return branches.sort();
  };

  if (isLoading) {
    return (
      <div
        role="status"
        className="flex items-center justify-center w-full h-[400px] shadow-xl bg-slate-100 rounded-lg animate-pulse"
      >
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white w-full h-[500px] border border-gray-300 rounded-xl shadow-lg mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center text-black">
          <BiSortAlt2
            onClick={() =>
              handleTopDataToggle(topData === "top" ? "last" : "top")
            }
            className="text-2xl text-green-500 cursor-pointer hover:text-green-600 transition-colors"
          />
          {topData === "last" ? "Low" : "Top"} Performance
        </h2>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleShowAllToggle}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              showAll 
                ? "bg-blue-600 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {showAll ? "Show Top 3" : "Show All"}
          </button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by name, branch, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        <select
          value={filterBranch}
          onChange={(e) => setFilterBranch(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Branches</option>
          {getUniqueBranches().map((branch) => (
            <option key={branch} value={branch}>
              {branch}
            </option>
          ))}
        </select>
      </div>

      {/* View Toggle */}
      {user?.role === "store_admin" ? null : (
        <div className="mb-4">
          <button className="bg-green-300 relative text-white flex gap-0 rounded-md text-sm transition-all duration-300">
            <span
              className={`flex-1 px-4 py-2 text-center rounded-l-md transition-colors duration-300 ${
                view === "employees"
                  ? "bg-green-700 text-white rounded-lg"
                  : "bg-gray-200 text-black"
              }`}
              onClick={() => handleViewToggle("employees")}
            >
              Employees
            </span>
            <span
              className={`flex-1 px-4 py-2 text-center rounded-r-md transition-colors duration-300 ${
                view === "branches"
                  ? "bg-green-700 text-white rounded-lg"
                  : "bg-gray-200 text-black"
              }`}
              onClick={() => handleViewToggle("branches")}
            >
              Branches
            </span>
          </button>
        </div>
      )}

      {/* Data Display */}
      <div className="flex-1 overflow-y-auto">
        {view === "employees" ? renderEmployees() : renderBranches()}
      </div>

      {/* Summary */}
      {allData.summary && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-semibold">Total Users:</span> {allData.summary.totalUsers || 0}
            </div>
            <div>
              <span className="font-semibold">Total Branches:</span> {allData.summary.totalBranches || 0}
            </div>
            <div>
              <span className="font-semibold">With Progress:</span> {allData.summary.usersWithTrainingProgress || 0}
            </div>
            <div>
              <span className="font-semibold">100% Complete:</span> {allData.summary.usersWith100PercentCompletion || 0}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedTopEmployeeAndBranch;
