import { Link } from "react-router-dom";
import RoundProgressBar from "../../components/RoundBar/RoundBar";
import Header from "../../components/Header/Header";
import { CiFilter } from "react-icons/ci";
import { useEffect, useState } from "react";
import baseUrl from "../../api/api";
import SideNav from "../../components/SideNav/SideNav";
import Card from "../../components/Skeleton/Card";
import { useSelector } from "react-redux";

const IOSUserTrainingData = () => {
    const [isOpen, setIsOpen] = useState({ range: false, branch: false, role: false });
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [filterRange, setFilterRange] = useState("");
    const [uniqueBranches, setUniqueBranches] = useState([]);
    const [uniqueItems, setUniqueItems] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState("");
    const [selectedItem, setSelectedItem] = useState("");
    
    const user = useSelector((state) => state.auth.user);

    const toggleDropdown = (type) => {
        setIsOpen((prev) => ({ ...prev, [type]: !prev[type] }));
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch trainings assigned to the current user
                const response = await fetch(`${baseUrl.baseUrl}api/usercreate/get/user/assignedtrainings/${user?.userId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error("Failed to fetch data");
                }
                
                const result = await response.json();

                // Extract uniqueBranches and uniqueItems
                const branches = new Set();
                const items = new Set();
                result.data.forEach((training) => {
                    if (training.uniqueBranches) {
                        training.uniqueBranches.forEach((branch) => branches.add(branch));
                    }
                    if (training.uniqueItems) {
                        training.uniqueItems.forEach((item) => items.add(item));
                    }
                });

                setUniqueBranches([...branches]);
                setUniqueItems([...items]);
                setData(result.data);
                setFilteredData(result.data);
            } catch (error) {
                console.error("Error fetching data:", error);
                // If the specific endpoint doesn't exist, try the general one
                try {
                    const fallbackResponse = await fetch(`${baseUrl.baseUrl}api/get/allusertraining`);
                    if (fallbackResponse.ok) {
                        const fallbackResult = await fallbackResponse.json();
                        setData(fallbackResult.data);
                        setFilteredData(fallbackResult.data);
                    }
                } catch (fallbackError) {
                    console.error("Fallback fetch also failed:", fallbackError);
                }
            } finally {
                setLoading(false);
            }
        };

        if (user?.userId) {
            fetchData();
        }
    }, [user?.userId]);

    // Filter data based on completion range, branch, and item
    const applyFilters = () => {
        let filtered = [...data];

        if (filterRange) {
            switch (filterRange) {
                case "0-25":
                    filtered = filtered.filter(
                        (item) =>
                            item.averageCompletionPercentage >= 0 &&
                            item.averageCompletionPercentage <= 25
                    );
                    break;
                case "26-51":
                    filtered = filtered.filter(
                        (item) =>
                            item.averageCompletionPercentage >= 26 &&
                            item.averageCompletionPercentage <= 51
                    );
                    break;
                case "52-77":
                    filtered = filtered.filter(
                        (item) =>
                            item.averageCompletionPercentage >= 52 &&
                            item.averageCompletionPercentage <= 77
                    );
                    break;
                case "78-100":
                    filtered = filtered.filter(
                        (item) =>
                            item.averageCompletionPercentage >= 78 &&
                            item.averageCompletionPercentage <= 100
                    );
                    break;
                default:
                    break;
            }
        }

        if (selectedBranch) {
            filtered = filtered.filter((item) =>
                item.uniqueBranches && item.uniqueBranches.includes(selectedBranch)
            );
        }

        if (selectedItem) {
            filtered = filtered.filter((item) =>
                item.uniqueItems && item.uniqueItems.includes(selectedItem)
            );
        }

        setFilteredData(filtered);
    };

    useEffect(() => {
        applyFilters();
    }, [filterRange, selectedBranch, selectedItem, data]);

    return (
        <>
            <div className="mb-[70px] w-full h-full bg-white">
                <div>
                    <Header name="My Assigned Trainings" />
                </div>
                <SideNav />
                <div className="md:ml-[100px] mt-[100px]">
                    <div>
                        <div className="flex justify-end mr-20">
                            <Link to={"/alltraining"}>
                                <div className="flex w-56 mt-5 border-2 justify-center items-center py-2 ml-10 cursor-pointer">
                                    <h4 className="text-black">Show All Training</h4>
                                </div>
                            </Link>
                        </div>
                        <div className="flex text-black ml-10 gap-5 text-xl w-auto">
                            <Link to="/training">
                                <h4 className="cursor-pointer">Mandatory Trainings</h4>
                            </Link>
                            <h4 className="border-b-[3px] border-[#016E5B] text-[#016E5B] ">
                                My Assigned Trainings
                            </h4>
                        </div>
                        <hr className="mx-10 mt-[-1px] border-[#016E5B]" />

                        <div className="flex mx-10 justify-between mt-10 gap-5">
                            {/* Filter by Range */}
                            <div className="flex gap-2">
                                <div className="relative text-left w-36">
                                    <button
                                        type="button"
                                        className="flex justify-between items-center w-full border-2 py-2 px-4 bg-white text-black rounded-md hover:bg-gray-200"
                                        onClick={() => toggleDropdown("range")}
                                    >
                                        <h4>{filterRange ? `${filterRange}%` : "Range"}</h4>
                                        <CiFilter className="text-[#016E5B]" />
                                    </button>
                                    {isOpen.range && (
                                        <div className="absolute mt-2 w-full rounded-md shadow-lg bg-white z-10">
                                            <div className="py-1">
                                                {["", "0-25", "26-51", "52-77", "78-100"].map((range) => (
                                                    <a
                                                        key={range}
                                                        href="#"
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setFilterRange(range);
                                                            toggleDropdown("range");
                                                        }}
                                                    >
                                                        {range ? `${range}%` : "All"}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Filter by Branch */}
                                <div className="relative text-left w-36">
                                    <button
                                        type="button"
                                        className="flex justify-between items-center w-full border-2 py-2 px-4 bg-white text-black rounded-md hover:bg-gray-200"
                                        onClick={() => toggleDropdown("branch")}
                                    >
                                        <h4>{selectedBranch || "Branch"}</h4>
                                        <CiFilter className="text-[#016E5B]" />
                                    </button>
                                    {isOpen.branch && (
                                        <div className="absolute mt-2 w-full rounded-md shadow-lg bg-white z-10">
                                            <div className="py-1">
                                                {["", ...uniqueBranches].map((branch) => (
                                                    <a
                                                        key={branch}
                                                        href="#"
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setSelectedBranch(branch);
                                                            toggleDropdown("branch");
                                                        }}
                                                    >
                                                        {branch || "All"}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Filter by Role */}
                                <div className="relative text-left w-36">
                                    <button
                                        type="button"
                                        className="flex justify-between items-center w-full border-2 py-2 px-4 bg-white text-black rounded-md hover:bg-gray-200"
                                        onClick={() => toggleDropdown("role")}
                                    >
                                        <h4>{selectedItem || "Role"}</h4>
                                        <CiFilter className="text-[#016E5B]" />
                                    </button>
                                    {isOpen.role && (
                                        <div className="absolute mt-2 w-full rounded-md shadow-lg bg-white z-10">
                                            <div className="py-1">
                                                {["", ...uniqueItems].map((item) => (
                                                    <a
                                                        key={item}
                                                        href="#"
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setSelectedItem(item);
                                                            toggleDropdown("role");
                                                        }}
                                                    >
                                                        {item || "All"}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 ml-10 flex flex-wrap gap-3">
                        {loading ? (
                            <>
                                <Card />
                                <Card />
                                <Card />
                                <Card />
                            </>
                        ) : filteredData.length > 0 ? (
                            filteredData.map((item) => (
                                <Link key={item.trainingId || item._id} to={`/assigtraining/${item.trainingId || item._id}`}>
                                    <RoundProgressBar
                                        initialProgress={item.averageCompletionPercentage || 0}
                                        title={item.trainingName || item.name}
                                        Module={`No. of Modules : ${item.numberOfModules || 0}`}
                                        duration={`Total Users: ${item.totalUsers || 0} | Assigned: ${item.totalAssignedUsers || 0}`}
                                        complete={`Completion Rate : ${item.averageCompletionPercentage || 0}%`}
                                    />
                                </Link>
                            ))
                        ) : (
                            <div className="w-full text-center py-10">
                                <h3 className="text-lg text-gray-600">No trainings assigned yet</h3>
                                <p className="text-gray-500 mt-2">Contact your administrator to get assigned to trainings</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default IOSUserTrainingData;
