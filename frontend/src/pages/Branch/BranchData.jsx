// import { useEffect, useState } from "react";
// import Header from "../../components/Header/Header";
// import { FaPlus } from "react-icons/fa";
// // import { CiFilter } from "react-icons/ci";
// import SideNav from "../../components/SideNav/SideNav";
// import baseUrl from "../../api/api";
// import { Link } from "react-router-dom";

// const BranchData = () => {
//     // const [isOpen, setIsOpen] = useState(false);
//     const [branch, setBranch] = useState([]);
//     const token = localStorage.getItem('token');

//     // const toggleDropdown = () => {
//     //     setIsOpen(prev => !prev);
//     // };

//     useEffect(() => {
//         const FetchUser = async () => {
//             try {
//                 const request = await fetch(baseUrl.baseUrl + 'api/usercreate/getBranch', {
//                     method: "GET",
//                     headers: {
//                         "Content-Type": "application/json",
//                         'Authorization': `Bearer ${token}`,
//                     },
//                     credentials: "include",
//                 });
//                 const response = await request.json(); // Await the JSON response

//                 if (response.data) {
//                     setBranch(response.data); // Set the branch data state
//                 }

//             } catch (error) {
//                 console.error("Error fetching branches:", error); // Log the error properly
//             }
//         };

//         FetchUser(); // Call the fetch function on component mount
//     }, []); // Add an empty dependency array to ensure it runs only once on mount

//     return (
//         <div className="mb-[70px]">
//             <div><Header name='Branch ' /></div>
//             <SideNav />
//             <div className="md:ml-[90px] mt-[150px]">
//                 <div className="flex justify-between mt-12">
//                     <Link to={'/Addbranch'} className="flex w-56 border-2 justify-evenly items-center py-2 ml-10 cursor-pointer">
//                         <div className="text-[#016E5B]">
//                             <FaPlus />
//                         </div>
//                         <h4 className="text-black">Add New Branch</h4>
//                     </Link>
//                     {/* <div className="relative inline-block text-left w-36 mr-10">
//                         <button
//                             type="button"
//                             className="flex justify-between items-center w-full border-2 py-2 px-4 bg-white text-black rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#016E5B]"
//                             onClick={toggleDropdown}
//                         >
//                             <h4>Filter</h4>
//                             <CiFilter className="text-[#016E5B]" />
//                         </button>

                      
//                         {isOpen && (
//                             <div
//                                 className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
//                                 role="menu"
//                                 aria-orientation="vertical"
//                             >
//                                 <div className="py-1">
//                                     <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Option 1</a>
//                                     <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Option 2</a>
//                                     <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Option 3</a>
//                                 </div>
//                             </div>
//                         )}
//                     </div> */}
//                 </div>
//                 <div className="overflow-x-auto mx-10 mt-5 flex justify-center">
//                     <table className="min-w-full border-2 border-gray-300">
//                         <thead>
//                             <tr className="bg-[#016E5B] text-white">
//                                 <th className="px-3 py-1  border-2 border-gray-300">LocCode</th>
//                                 <th className="px-3 py-1 border-2 border-gray-300">Name</th>
//                                 <th className="px-3 py-1 border-2 border-gray-300">No of emp</th>
//                                 <th className="px-3 py-1 border-2 border-gray-300">No of Training </th>
//                                 <th className="px-3 py-1 border-2 border-gray-300">No of Assessment</th>
//                                 <th className="px-3 py-1 border-2 border-gray-300">Details</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {branch?.map((branch, index) => (
//                                 <tr key={index} className="border-b hover:bg-gray-100 text-black">
//                                     <td className="px-3 py-2 border-2 border-gray-300 text-center">{branch?.locCode}</td>
//                                     <td className="px-3 py-1 border-2 border-gray-300 text-center">{branch.workingBranch}</td>
//                                     <td className="px-3 py-1 border-2 border-gray-300 text-center">{branch.userCount}</td>
//                                     <td className="px-3 py-1 border-2 border-gray-300 text-center">{branch.totalTrainingCount}</td>
//                                     <td className="px-3 py-1 border-2 border-gray-300 text-center">{branch.totalAssessmentCount}</td>
//                                     <td className="px-3 py-1 border-2 border-gray-300 text-center">                                    <Link to={`/branch/detailed/${branch?.locCode}`} >
//                                         Edit                                   </Link>
//                                     </td>
//                                 </tr>

//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default BranchData;


import { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import { FaPlus, FaEdit, FaBuilding } from "react-icons/fa";
import { HiUsers, HiAcademicCap, HiClipboardCheck } from "react-icons/hi";
import SideNav from "../../components/SideNav/SideNav";
import baseUrl from "../../api/api";
import { Link } from "react-router-dom";

const BranchData = () => {
    const [branch, setBranch] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isMobile, setIsMobile] = useState(false);
    const token = localStorage.getItem('token');

    // Check for mobile viewport
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                setLoading(true);
                const request = await fetch(baseUrl.baseUrl + 'api/usercreate/getBranch', {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${token}`,
                    },
                    credentials: "include",
                });
                
                if (!request.ok) {
                    throw new Error(`HTTP ${request.status} ${request.statusText}`);
                }
                
                const response = await request.json();

                if (response.data) {
                    setBranch(response.data);
                    setError("");
                } else {
                    setBranch([]);
                }
            } catch (error) {
                console.error("Error fetching branches:", error);
                setError("Failed to load branch data. Please try again later.");
                setBranch([]);
            } finally {
                setLoading(false);
            }
        };

        fetchBranches();
    }, [token]);

    // Mobile Branch Card Component
    const MobileBranchCard = ({ branchData, index }) => (
        <div className={`p-4 rounded-lg border ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} mb-4 shadow-sm`}>
            {/* Header with branch name and edit button */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <FaBuilding className="text-[#016E5B]" size={16} />
                        <h3 className="font-semibold text-[#016E5B] text-lg">
                            {branchData.workingBranch || 'N/A'}
                        </h3>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">
                        Code: {branchData?.locCode || 'N/A'}
                    </p>
                </div>
                <Link 
                    to={`/branch/detailed/${branchData?.locCode}`}
                    className="bg-[#016E5B] text-white px-3 py-1.5 rounded-md text-sm hover:bg-[#014C3F] transition-colors flex items-center gap-1"
                >
                    <FaEdit size={12} />
                    Edit
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <HiUsers className="mx-auto text-blue-600 mb-1" size={20} />
                    <div className="font-semibold text-blue-700 text-lg">
                        {branchData.userCount || 0}
                    </div>
                    <div className="text-xs text-blue-600 font-medium">Employees</div>
                </div>
                
                <div className="text-center p-3 bg-green-50 rounded-lg">
                    <HiAcademicCap className="mx-auto text-green-600 mb-1" size={20} />
                    <div className="font-semibold text-green-700 text-lg">
                        {branchData.totalTrainingCount || 0}
                    </div>
                    <div className="text-xs text-green-600 font-medium">Trainings</div>
                </div>
                
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <HiClipboardCheck className="mx-auto text-purple-600 mb-1" size={20} />
                    <div className="font-semibold text-purple-700 text-lg">
                        {branchData.totalAssessmentCount || 0}
                    </div>
                    <div className="text-xs text-purple-600 font-medium">Assessments</div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="mb-[70px]">
                <Header name='Branch' />
                <SideNav />
                <div className="md:ml-[90px] mt-[160px] px-4 sm:px-6 lg:px-12">
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#016E5B]"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-[70px]">
            <Header name='Branch' />
            <SideNav />
            
            <div className="md:ml-[90px] mt-[160px] sm:mt-[140px]">
                {/* Header Section */}
                <div className="px-4 sm:px-6 lg:px-12">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mt-8 sm:mt-12 mb-6">
                        <h1 className="text-[#212121] text-xl sm:text-2xl font-semibold">
                            Branch Management
                        </h1>
                        
                        <Link 
                            to={'/Addbranch'} 
                            className="flex items-center justify-center gap-3 w-full sm:w-auto bg-[#016E5B] hover:bg-[#014C3F] text-white px-4 py-2.5 rounded-md transition-colors font-medium"
                        >
                            <FaPlus size={14} />
                            Add New Branch
                        </Link>
                    </div>

                    {/* Results count */}
                    <div className="text-sm text-gray-600 mb-4">
                        Total branches: {branch.length}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="text-red-500 text-center my-4 mx-4 sm:mx-6 lg:mx-12 p-3 bg-red-50 border border-red-200 rounded-md text-sm">
                        {error}
                    </div>
                )}

                {/* Content */}
                <div className="mx-4 sm:mx-6 lg:mx-12">
                    {branch.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                            <div className="flex flex-col items-center gap-3">
                                <FaBuilding className="text-4xl text-gray-400" />
                                <span className="text-lg font-medium">No branches found</span>
                                <span className="text-sm">Get started by adding a new branch</span>
                                <Link 
                                    to={'/Addbranch'} 
                                    className="mt-2 bg-[#016E5B] text-white px-4 py-2 rounded-md hover:bg-[#014C3F] transition-colors text-sm"
                                >
                                    Add First Branch
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Mobile View */}
                            {isMobile ? (
                                <div className="space-y-4">
                                    {branch.map((branchData, index) => (
                                        <MobileBranchCard 
                                            key={index} 
                                            branchData={branchData} 
                                            index={index} 
                                        />
                                    ))}
                                </div>
                            ) : (
                                /* Desktop/Tablet Table View */
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-[#016E5B] text-white">
                                                <tr>
                                                    <th className="px-4 py-3 text-center font-semibold border-r border-[#014C3F] min-w-[100px]">
                                                        Location Code
                                                    </th>
                                                    <th className="px-4 py-3 text-center font-semibold border-r border-[#014C3F] min-w-[180px]">
                                                        Branch Name
                                                    </th>
                                                    <th className="px-4 py-3 text-center font-semibold border-r border-[#014C3F] min-w-[120px]">
                                                        Employees
                                                    </th>
                                                    <th className="px-4 py-3 text-center font-semibold border-r border-[#014C3F] min-w-[120px] hidden lg:table-cell">
                                                        Trainings
                                                    </th>
                                                    <th className="px-4 py-3 text-center font-semibold border-r border-[#014C3F] min-w-[130px] hidden lg:table-cell">
                                                        Assessments
                                                    </th>
                                                    <th className="px-4 py-3 text-center font-semibold min-w-[80px]">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {branch.map((branchData, index) => (
                                                    <tr 
                                                        key={index} 
                                                        className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-all`}
                                                    >
                                                        <td className="px-4 py-3 text-center font-medium text-[#016E5B] border-r border-gray-200">
                                                            {branchData?.locCode || 'N/A'}
                                                        </td>
                                                        <td className="px-4 py-3 border-r border-gray-200">
                                                            <div className="text-center lg:text-left">
                                                                <div className="font-medium text-gray-900">
                                                                    {branchData.workingBranch || 'N/A'}
                                                                </div>
                                                                {/* Show stats on smaller screens */}
                                                                <div className="lg:hidden mt-1 text-xs text-gray-500 space-y-1">
                                                                    <div>Training: {branchData.totalTrainingCount || 0}</div>
                                                                    <div>Assessments: {branchData.totalAssessmentCount || 0}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center font-medium border-r border-gray-200">
                                                            <div className="flex items-center justify-center gap-1">
                                                                <HiUsers className="text-blue-600" size={14} />
                                                                {branchData.userCount || 0}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center font-medium border-r border-gray-200 hidden lg:table-cell">
                                                            <div className="flex items-center justify-center gap-1">
                                                                <HiAcademicCap className="text-green-600" size={14} />
                                                                {branchData.totalTrainingCount || 0}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center font-medium border-r border-gray-200 hidden lg:table-cell">
                                                            <div className="flex items-center justify-center gap-1">
                                                                <HiClipboardCheck className="text-purple-600" size={14} />
                                                                {branchData.totalAssessmentCount || 0}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <Link 
                                                                to={`/branch/detailed/${branchData?.locCode}`}
                                                                className="inline-flex items-center gap-1 text-[#016E5B] font-semibold hover:text-[#014C3F] hover:underline transition-colors text-sm px-2 py-1 rounded"
                                                            >
                                                                <FaEdit size={12} />
                                                                Edit
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BranchData;
