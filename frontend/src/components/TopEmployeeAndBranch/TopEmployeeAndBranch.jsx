import { useEffect, useState } from "react";
import baseUrl from "../../api/api";
import { BiSortAlt2 } from "react-icons/bi";
import { useSelector } from "react-redux";

const TopEmployeeAndBranch = () => {
  const [allData, setAllData] = useState({});
  const [view, setView] = useState("employees"); // "employees" or "branches"
  const [topData, setTopData] = useState("top"); // "top" or "last"
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem("token");
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("🔄 Starting data fetch...");
        console.log("🎯 Trying ENHANCED API endpoint: /api/admin/get/allUsersAndBranches");
        
        // Try the enhanced API endpoint first
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
        console.log("✅ ENHANCED API SUCCESS!");
        console.log("📊 Enhanced API Response:", result);
        console.log("📋 Data structure:", {
          hasAllUsers: !!result.data?.allUsers,
          hasAllBranches: !!result.data?.allBranches,
          allUsersCount: result.data?.allUsers?.length || 0,
          allBranchesCount: result.data?.allBranches?.length || 0
        });
        
        // Log detailed user data to see what's actually being sent
        if (result.data?.allUsers && result.data.allUsers.length > 0) {
          console.log("🔍 FIRST 3 USERS DETAILED DATA:");
          result.data.allUsers.slice(0, 3).forEach((user, index) => {
            console.log(`User ${index + 1}:`, {
              username: user.username,
              trainingProgress: user.trainingProgress,
              assessmentProgress: user.assessmentProgress,
              branch: user.branch,
              totalScore: user.totalScore,
              completedTrainings: user.completedTrainings
            });
          });
        }
        
        setAllData(result.data || {});
        console.log("Enhanced data set:", result.data);
      } catch (error) {
        console.error("❌ ENHANCED API FAILED:", error.message);
        console.log("🔄 Falling back to ORIGINAL API...");
        
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
            console.log("✅ FALLBACK API SUCCESS!");
            console.log("📊 Fallback API Response:", fallbackResult);
            console.log("📋 Fallback data structure:", {
              hasTopUsers: !!fallbackResult.data?.topUsers,
              hasTopBranches: !!fallbackResult.data?.topBranches,
              topUsersCount: fallbackResult.data?.topUsers?.length || 0,
              topBranchesCount: fallbackResult.data?.topBranches?.length || 0
            });
            
            setAllData(fallbackResult.data || {});
            console.log("Fallback data set:", fallbackResult.data);
          } else {
            console.error("❌ FALLBACK API ALSO FAILED:", fallbackResponse.status);
          }
        } catch (fallbackError) {
          console.error("❌ FALLBACK ERROR:", fallbackError.message);
        }
      } finally {
        setIsLoading(false);
        console.log("🏁 Data fetch completed. Current allData:", allData);
      }
    };

    fetchData();
  }, [token]);

  const handleTopDataToggle = (type) => setTopData(type);
  const handleViewToggle = (type) => setView(type);

  // Render employees
  const renderEmployees = () => {
    console.log("🎭 Rendering employees...");
    console.log("📊 Current allData:", allData);
    
         // Handle both old and new API response formats
     let users = [];
     if (allData.allUsers) {
                console.log("✅ Using ENHANCED API format (allUsers)");
         console.log("📊 Total users available:", allData.allUsers.length);
         console.log("🔍 Sample user data:", allData.allUsers.slice(0, 3).map(u => ({
           username: u.username,
           trainingProgress: u.trainingProgress,
           assessmentProgress: u.assessmentProgress,
           branch: u.branch,
           dataType: typeof u.trainingProgress
         })));
       
       // For enhanced API, show ALL users, not just top 3
       users = allData.allUsers;
       
               // Sort by training progress first, then by assessment score
        console.log("🔄 Starting user sorting...");
        users.sort((a, b) => {
          // Convert percentage strings back to numbers for sorting
          // Handle both "40.0%" format and numeric values
          const aProgress = typeof a.trainingProgress === 'string' 
            ? parseFloat(a.trainingProgress.replace('%', '')) || 0
            : parseFloat(a.trainingProgress) || 0;
          const bProgress = typeof b.trainingProgress === 'string'
            ? parseFloat(b.trainingProgress.replace('%', '')) || 0
            : parseFloat(b.trainingProgress) || 0;
          
          if (bProgress !== aProgress) {
            return bProgress - aProgress; // Primary sort by training progress
          }
          
          // Secondary sort by assessment score
          const aAssessment = typeof a.assessmentProgress === 'string'
            ? parseFloat(a.assessmentProgress.replace('%', '')) || 0
            : parseFloat(a.assessmentProgress) || 0;
          const bAssessment = typeof b.assessmentProgress === 'string'
            ? parseFloat(b.assessmentProgress.replace('%', '')) || 0
            : parseFloat(b.assessmentProgress) || 0;
          return bAssessment - aAssessment;
        });
        console.log("✅ User sorting completed");
       
       // Now slice for display
       if (topData === "top") {
         users = users.slice(0, 10); // Show top 10 instead of just 3
       } else {
         users = users.slice(-10); // Show last 10 instead of just 3
       }
     } else {
       console.log("⚠️ Using FALLBACK API format (topUsers/lastUsers)");
       users = topData === "top" ? allData.topUsers : allData.lastUsers;
     }
    
    console.log("👥 Users to render:", users);
    console.log("🔍 User details:", users.map(u => ({
      username: u.username,
      trainingProgress: u.trainingProgress,
      assessmentProgress: u.assessmentProgress,
      branch: u.branch
    })));

         if (!users || users.length === 0) return <p>No data available</p>;

     // Users are already sorted by the enhanced API logic above
     return users.map((emp, index) => (
      <div key={index} className="flex items-center bg-gray-100 p-2 rounded-md">
        <div
          className={`flex items-center justify-center w-12 h-12 ${
            index + 1 === 1
              ? "bg-green-400"
              : index + 1 === 2
              ? "bg-yellow-400"
              : "bg-red-400"
          } text-white font-bold text-lg rounded-full`}
        >
          {index + 1}
        </div>
        <div className="ml-4 flex-1">
          <p className="font-medium">{emp.username || "No Name"}</p>
          <p className="text-gray-500 text-sm">{emp.branch}</p>
        </div>
                 <div className="text-right">
           <p className="font-bold text-green-600">
             {emp.trainingProgress || "0%"} {" "}
             <span className="text-gray-500">Training Completed</span>
           </p>
           <p className="font-bold text-green-600">
             {emp.assessmentProgress || "0%"} {" "}
             <span className="text-gray-500">Assessment Score</span>
           </p>
         </div>
      </div>
    ));
  };

  // Render branches
  const renderBranches = () => {
         // Handle both old and new API response formats
     let branches = [];
     if (allData.allBranches) {
       console.log("✅ Using ENHANCED API format (allBranches)");
       console.log("📊 Total branches available:", allData.allBranches.length);
       
       // For enhanced API, show ALL branches, not just top 3
       branches = allData.allBranches;
       
               // Sort by average training progress
        branches.sort((a, b) => {
          // Handle both "40.0%" format and numeric values
          const aProgress = typeof a.averageTrainingProgress === 'string'
            ? parseFloat(a.averageTrainingProgress.replace('%', '')) || 0
            : parseFloat(a.averageTrainingProgress) || 0;
          const bProgress = typeof b.averageTrainingProgress === 'string'
            ? parseFloat(b.averageTrainingProgress.replace('%', '')) || 0
            : parseFloat(b.averageTrainingProgress) || 0;
          return bProgress - aProgress;
        });
       
       // Now slice for display
       if (topData === "top") {
         branches = branches.slice(0, 10); // Show top 10 instead of just 3
       } else {
         branches = branches.slice(-10); // Show last 10 instead of just 3
       }
     } else {
       console.log("⚠️ Using FALLBACK API format (topBranches/lastBranches)");
       branches = topData === "top" ? allData.topBranches : allData.lastBranches;
     }

    if (!branches || branches.length === 0) return <p>No data available</p>;

    return branches.map((branch, index) => (
      <div key={index} className="flex items-center bg-gray-100 p-2 rounded-md">
        <div
          className={`flex items-center justify-center w-12 h-12 ${
            index + 1 === 1
              ? "bg-green-400"
              : index + 1 === 2
              ? "bg-yellow-400"
              : "bg-red-400"
          } text-white font-bold text-lg rounded-full`}
        >
          {index + 1}
        </div>

        <div className="ml-4 flex-1">
          <p className="font-medium">{branch.branch}</p>
        </div>
                 <div className="text-right">
           <p className="font-bold text-green-600">
             {branch?.averageTrainingProgress || "0%"} {" "}
             <span className="text-gray-500">Completed Training</span>
           </p>
           <p className="font-bold text-green-600">
             {branch?.averageAssessmentProgress || "0%"} {" "}
             <span className="text-gray-500">Completed Assessment</span>
           </p>
         </div>
      </div>
    ));
  };

  if (isLoading) {
    return (
      <div
        role="status"
        className="flex items-center justify-center  w-[600px] h-[400px] shadow-xl bg-slate-100 rounded-lg animate-pulse"
      >
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div className="p-2 bg-white  w-full h-[400px] border border-gray-300 rounded-xl shadow-lg mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold flex items-center text-black">
          <BiSortAlt2
            onClick={() =>
              handleTopDataToggle(topData === "top" ? "last" : "top")
            }
            className="text-2xl text-green-500 cursor-pointer"
          />
          {topData === "last" ? "Low" : " Top"} Performance
        </h2>
      </div>

      <div className="flex items-center justify-between ">
        {user?.role === "store_admin" ? null : (
          <div className="mb-4">
            <button
              className={`bg-green-300 relative text-white  flex gap-0 rounded-md text-sm transition-all duration-300 `}
              onClick={() =>
                handleViewToggle(view === "employees" ? "branches" : "employees")
              }
            >
              {/* Employees Section */}
              <span
                className={`flex-1 px-4 py-2 text-center rounded-l-md transition-colors duration-300 ${
                  view === "employees"
                    ? "bg-green-700 text-white rounded-lg"
                    : "bg-gray-200 text-black "
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewToggle("employees");
                }}
              >
                Employees
              </span>

              {/* Branches Section */}
              <span
                className={`flex-1 px-4 py-2 text-center rounded-r-md transition-colors duration-300 ${
                  view === "branches"
                    ? "bg-green-700 text-white rounded-lg"
                    : "bg-gray-200 text-black "
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewToggle("branches");
                }}
              >
                Branches
              </span>
            </button>
          </div>
        )}

        <div className="mb-4"></div>
      </div>

      <div className="space-y-4">
        {view === "employees" ? renderEmployees() : renderBranches()}
      </div>
    </div>
  );
};

export default TopEmployeeAndBranch;
