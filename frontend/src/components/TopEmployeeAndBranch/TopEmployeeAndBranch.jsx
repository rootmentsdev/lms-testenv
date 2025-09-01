import { useEffect, useState } from "react";
import baseUrl from "../../api/api";
// import { FaSortAmountDownAlt } from "react-icons/fa";
// import { FaSortAmountUp } from "react-icons/fa";
import { BiSortAlt2 } from "react-icons/bi";
import { useSelector } from "react-redux";


const TopEmployeeAndBranch = () => {
    const [allData, setAllData] = useState({});
    const [view, setView] = useState("employees"); // "employees" or "branches"
    const [topData, setTopData] = useState("top"); // "top" or "last"
    const [isLoading, setIsLoading] = useState(true); // For loading state
    const [error, setError] = useState(null); // For error state
    const token = localStorage.getItem('token');
    const user = useSelector((state) => state.auth.user); // Access user from Redux store


    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('🔍 Fetching top performance data...');
                setError(null);
                
                const response = await fetch(`${baseUrl.baseUrl}api/admin/get/bestThreeUser`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${token}`,
                    },
                    credentials: "include",
                });
                
                console.log('📡 API Response Status:', response.status);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('❌ API Error:', response.status, errorText);
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }
                
                const result = await response.json();
                console.log('📊 API Response Data:', result);
                
                if (result.data) {
                    setAllData(result.data);
                    console.log('✅ Data set successfully:', result.data);
                } else {
                    console.warn('⚠️ No data property in response:', result);
                    setAllData({});
                }

                setIsLoading(false); // Data is fetched, hide the loading state
            } catch (error) {
                console.error("❌ Failed to fetch data:", error.message);
                setError(error.message);
                setIsLoading(false); // Set loading to false even on error
            }
        };

        if (token) {
            fetchData();
        } else {
            console.error('❌ No token found');
            setError('No authentication token found');
            setIsLoading(false);
        }
    }, [token]);

    // Function to handle toggling between 'top' and 'last' data
    const handleTopDataToggle = (type) => {
        setTopData(type);
    };

    // Function to handle toggling between 'employees' and 'branches'
    const handleViewToggle = (type) => {
        setView(type);
    };

    // Render employees
    const renderEmployees = () => {
        // Check if the data is available before rendering
        const users = topData === "top" ? allData.topUsers : allData.lastUsers;
        
        console.log(`👥 Rendering ${view} (${topData}):`, users);

        if (!users || users.length === 0) {
            return (
                <div className="text-center py-8">
                    <p className="text-gray-500 text-lg">No employee data available</p>
                    <p className="text-gray-400 text-sm mt-2">
                        {topData === 'top' ? 'Top performing employees' : 'Low performing employees'} not found
                    </p>
                </div>
            );
        }

        // Sort users by Training Completed first, then by Assessment Score
        const sortedUsers = [...users].sort((a, b) => {
            if (b.trainingProgress === a.trainingProgress) {
                return b.assessmentProgress - a.assessmentProgress; // Secondary sort by Assessment Score
            }
            return b.trainingProgress - a.trainingProgress; // Primary sort by Training Completed
        });

        return sortedUsers.map((user, index) => (
            <div key={index} className="flex items-center bg-gray-100 p-2 rounded-md">
                <div className={`flex items-center justify-center w-12 h-12 ${index + 1 === 1 ? 'bg-green-400' : index + 1 === 2 ? 'bg-yellow-400' : 'bg-red-400'} text-white font-bold text-lg rounded-full`}>
                    {index + 1}
                </div>
                <div className="ml-4 flex-1">
                    <p className="font-medium">{user.username}</p>
                    <p className="text-gray-500 text-sm">{user.branch}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-green-600">{Math.round(user.trainingProgress)}% <span className="text-gray-500">Training Completed</span></p>
                    <p className="font-bold text-green-600">{Math.round(user.assessmentProgress)}% <span className="text-gray-500">Assessment Score</span></p>
                </div>
            </div>
        ));
    };


    // Render branches
    const renderBranches = () => {
        // Check if the data is available before rendering
        const branches = topData === "top" ? allData.topBranches : allData.lastBranches;
        
        console.log(`🏢 Rendering ${view} (${topData}):`, branches);
        
        if (!branches || branches.length === 0) {
            return (
                <div className="text-center py-8">
                    <p className="text-gray-500 text-lg">No branch data available</p>
                    <p className="text-gray-400 text-sm mt-2">
                        {topData === 'top' ? 'Top performing branches' : 'Low performing branches'} not found
                    </p>
                </div>
            );
        }

        return branches.map((branch, index) => (
            <div key={index} className="flex items-center bg-gray-100 p-2 rounded-md">
                <div className={`flex items-center justify-center w-12 h-12 ${index + 1 === 1 ? 'bg-green-400' : index + 1 === 2 ? 'bg-yellow-400' : 'bg-red-400'} text-white font-bold text-lg rounded-full`}>
                    {index + 1}
                </div>

                <div className="ml-4 flex-1">
                    <p className="font-medium">{branch.branch}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-green-600">{Math.round(branch?.averageTrainingProgress) + " %"} <span className="text-gray-500">Completed Training</span></p>
                    <p className="font-bold text-green-600">{Math.round(branch.averageAssessmentProgress) + " %"} <span className="text-gray-500">Completed Assessment</span></p>
                </div>
            </div>
        ));
    };

    // Show error state
    if (error) {
        return (
            <div className="p-2 bg-white w-full h-[400px] border border-red-300 rounded-xl shadow-lg mx-auto">
                <div className="flex flex-col items-center justify-center h-full">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h3 className="text-lg font-bold text-red-600 mb-2">Error Loading Data</h3>
                    <p className="text-gray-600 text-center mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return <div role="status" className="flex items-center justify-center  w-[600px] h-[400px] shadow-xl bg-slate-100 rounded-lg animate-pulse d">
            <span className="sr-only">Loading...</span>
        </div>; // Show loading text until data is available
    }

    return (
        <div className="p-2 bg-white  w-full h-[400px] border border-gray-300 rounded-xl shadow-lg mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold flex items-center text-black"> <BiSortAlt2 onClick={() => handleTopDataToggle(topData === "top" ? "last" : "top")} className="text-2xl text-green-500 cursor-pointer" /> {topData === 'last' ? "Low" : " Top"} Performance</h2>
            </div>
            <div className="flex items-center justify-between ">
                {user?.role === 'store_admin' ? null : <div className="mb-4">
                    <button
                        className={`bg-green-300 relative text-white  flex gap-0 rounded-md text-sm transition-all duration-300 `}
                        onClick={() => handleViewToggle(view === "employees" ? "branches" : "employees")}
                    >
                        {/* Employees Section */}
                        <span
                            className={`flex-1 px-4 py-2 text-center rounded-l-md transition-colors duration-300 ${view === "employees" ? "bg-green-700 text-white rounded-lg" : "bg-gray-200 text-black "
                                }`}
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent the parent button's click event
                                handleViewToggle("employees");
                            }}
                        >
                            Employees
                        </span>

                        {/* Branches Section */}
                        <span
                            className={`flex-1 px-4 py-2 text-center rounded-r-md transition-colors duration-300 ${view === "branches" ? "bg-green-700 text-white rounded-lg" : "bg-gray-200 text-black "
                                }`}
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent the parent button's click event
                                handleViewToggle("branches");
                            }}
                        >
                            Branches
                        </span>
                    </button>



                </div>}

                <div className="mb-4">


                </div>
            </div>

            <div className="space-y-4">
                {view === "employees" ? renderEmployees() : renderBranches()}
            </div>
        </div >






    );
};

export default TopEmployeeAndBranch;
