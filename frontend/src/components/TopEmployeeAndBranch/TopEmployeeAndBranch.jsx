import { useEffect, useState } from "react";
import baseUrl from "../../api/api";
// import { FaSortAmountDownAlt } from "react-icons/fa";
// import { FaSortAmountUp } from "react-icons/fa";
import { BiSortAlt2 } from "react-icons/bi";


const TopEmployeeAndBranch = () => {
    const [allData, setAllData] = useState({});
    const [view, setView] = useState("employees"); // "employees" or "branches"
    const [topData, setTopData] = useState("top"); // "top" or "last"
    const [isLoading, setIsLoading] = useState(true); // For loading state

    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${baseUrl.baseUrl}api/admin/get/bestThreeUser`);
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
                const result = await response.json();
                setAllData(result.data);
                console.log(result.data);

                setIsLoading(false); // Data is fetched, hide the loading state
            } catch (error) {
                console.error("Failed to fetch data:", error.message);
                setIsLoading(false); // Set loading to false even on error
            }
        };

        fetchData();
    }, []);

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
        if (!users || users.length === 0) return <p>No data available</p>;

        return users.map((user, index) => (
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
        if (!branches || branches.length === 0) return <p>No data available</p>;

        return branches.map((branch, index) => (
            <div key={index} className="flex items-center bg-gray-100 p-2 rounded-md">
                <div className={`flex items-center justify-center w-12 h-12 ${index + 1 === 1 ? 'bg-green-400' : index + 1 === 2 ? 'bg-yellow-400' : 'bg-red-400'} text-white font-bold text-lg rounded-full`}>
                    {index + 1}
                </div>

                <div className="ml-4 flex-1">
                    <p className="font-medium">{branch.branch}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-green-600">{Math.round(branch?.averageTrainingProgress) + " %"} <span className="text-gray-500">Total Training</span></p>
                    <p className="font-bold text-green-600">{Math.round(branch.averageAssessmentProgress) + " %"} <span className="text-gray-500">Total Assessment</span></p>
                </div>
            </div>
        ));
    };

    if (isLoading) {
        return <p>Loading...</p>; // Show loading text until data is available
    }

    return (
        <div className="p-2 bg-white shadow-md rounded-md w-full h-full mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold flex items-center text-black"> <BiSortAlt2 onClick={() => handleTopDataToggle(topData === "top" ? "last" : "top")} className="text-2xl text-green-500 cursor-pointer" /> {topData} Performance</h2>
            </div>
            <div className="flex items-center justify-between mx-10">
                <div className="mb-4">
                    <button
                        className={`bg-green-300 relative text-white  flex gap-0 rounded-md text-sm transition-all duration-300 focus:ring-2 focus:ring-green-500`}
                        onClick={() => handleViewToggle(view === "employees" ? "branches" : "employees")}
                    >
                        {/* Employees Section */}
                        <span
                            className={`flex-1 px-4 py-2 text-center rounded-l-md transition-colors duration-300 ${view === "employees" ? "bg-green-700 text-white" : "bg-green-600 text-white"
                                }`}
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent the parent button's click event
                                handleViewToggle("employees");
                            }}
                        >
                            employees
                        </span>

                        {/* Branches Section */}
                        <span
                            className={`flex-1 px-4 py-2 text-center rounded-r-md transition-colors duration-300 ${view === "branches" ? "bg-green-700 text-white" : "bg-green-600 text-white"
                                }`}
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent the parent button's click event
                                handleViewToggle("branches");
                            }}
                        >
                            branches
                        </span>
                    </button>



                </div>
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
