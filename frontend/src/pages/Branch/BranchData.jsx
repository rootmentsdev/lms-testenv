import { useState } from "react";
import Header from "../../components/Header/Header"
import { FaPlus } from "react-icons/fa";
import { CiFilter } from "react-icons/ci";

const BranchData = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => {
        setIsOpen(prev => !prev);
    };
    const employees = [
        {
            branchId: "B001",
            name: "GROOMS",
            location: "Kottayam",
            noOfEmp: 12,
            training: "React, Node.js",
            assessments: "Completed",
            profile: "Profile1.jpg",
        },
        {
            branchId: "B002",
            name: "GROOMS",
            location: "Chennai",
            noOfEmp: 41,
            training: "Figma, Adobe XD",
            assessments: "Completed",
            profile: "Profile2.jpg",
        },
        {
            branchId: "B003",
            name: "GROOMS",
            location: "Mumbai",
            noOfEmp: 16,
            training: "Python, Django",
            assessments: "Pending",
            profile: "Profile3.jpg",
        },
        {
            branchId: "B004",
            name: "GROOMS",
            location: "Delhi",
            noOfEmp: 91,
            training: "Agile, Scrum",
            assessments: "Completed",
            profile: "Profile4.jpg",
        },
        {
            branchId: "B005",
            name: "GROOMS",
            location: "Bangalore",
            noOfEmp: 75,
            training: "Docker, Kubernetes",
            assessments: "Pending",
            profile: "Profile5.jpg",
        },
        {
            branchId: "B006",
            name: "GROOMS",
            location: "Bangalore",
            noOfEmp: 51,
            training: "Docker, Kubernetes",
            assessments: "Pending",
            profile: "Profile5.jpg",
        },
        {
            branchId: "B007",
            name: "GROOMS",
            location: "Bangalore",
            noOfEmp: 78,
            training: "Docker, Kubernetes",
            assessments: "Pending",
            profile: "Profile5.jpg",
        },
        {
            branchId: "B008",
            name: "GROOMS",
            location: "Bangalore",
            noOfEmp: 51,
            training: "Docker, Kubernetes",
            assessments: "Pending",
            profile: "Profile5.jpg",
        },
        {
            branchId: "B009",
            name: "GROOMS",
            location: "Bangalore",
            noOfEmp: 15,
            training: "Docker, Kubernetes",
            assessments: "Pending",
            profile: "Profile5.jpg",
        },
    ];


    return (
        <div>
            <div><Header name='Employee' /></div>
            <div>
                <div className="flex justify-between mt-12">
                    <div className="flex w-56 border-2 justify-evenly items-center py-2 ml-10 cursor-pointer
                    ">
                        <div className="text-green-500">
                            <FaPlus />
                        </div>
                        <h4 className="text-black">Add New Employee</h4>
                    </div>
                    <div className="relative inline-block text-left w-36 mr-10">
                        <button
                            type="button"
                            className="flex justify-between items-center w-full border-2 py-2 px-4 bg-white text-black rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            onClick={toggleDropdown}
                        >
                            <h4>Filter</h4>
                            <CiFilter className="text-green-500" />
                        </button>

                        {/* Dropdown Menu */}
                        {isOpen && (
                            <div
                                className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                                role="menu"
                                aria-orientation="vertical"
                            >
                                <div className="py-1">
                                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Option 1</a>
                                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Option 2</a>
                                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Option 3</a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="overflow-x-auto mx-10 mt-5 flex justify-center">
                    <table className="min-w-full border-2 border-gray-300">
                        <thead>
                            <tr className="bg-green-500 text-white">
                                <th className="px-3 py-1 border-2 border-gray-300">Emp Id</th>
                                <th className="px-3 py-1 border-2 border-gray-300">Name</th>
                                <th className="px-3 py-1 border-2 border-gray-300">No of emp</th>

                                <th className="px-3 py-1 border-2 border-gray-300">Branch</th>
                                <th className="px-3 py-1 border-2 border-gray-300">Training</th>
                                <th className="px-3 py-1 border-2 border-gray-300">Assessments</th>
                                <th className="px-3 py-1 border-2 border-gray-300">Profile</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((employee, index) => (
                                <tr key={index} className="border-b hover:bg-gray-100">
                                    <td className="px-3 py-1 border-2 border-gray-300">{employee.branchId}</td>
                                    <td className="px-3 py-1 border-2 border-gray-300">{employee.name}</td>
                                    <td className="px-3 py-1 border-2 border-gray-300">{employee.noOfEmp}</td>

                                    <td className="px-3 py-1 border-2 border-gray-300">{employee.location}</td>
                                    <td className="px-3 py-1 border-2 border-gray-300">{employee.training}</td>
                                    <td className="px-3 py-1 border-2 border-gray-300">{employee.assessments}</td>
                                    <td className="px-3 py-1 border-2 border-gray-300">
                                        {employee.profile}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default BranchData