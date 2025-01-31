import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SideNav from "../../../components/SideNav/SideNav";
import Header from "../../../components/Header/Header";
import { GoPencil } from "react-icons/go";
import { FaRegTrashCan } from "react-icons/fa6";
import baseUrl from "../../../api/api.js";
import { toast } from 'react-toastify';


const EmployeeDetaileData = () => {
    const token = localStorage.getItem('token');
    const { id } = useParams();
    const [isEditing, setIsEditing] = useState(false);
    const [data, setData] = useState({}); // Changed from `[]` to `{}` for proper object handling
    const [fulldata, setfullData] = useState({}); // Changed from `[]` to `{}` for proper object handling

    const handleSave = async () => {
        console.log("Updated Data:", data); // Logs the edited data when clicking "Save"

        try {
            const response = await fetch(`${baseUrl.baseUrl}api/admin/user/update/${id}`, {
                method: 'PUT', // Assuming you use a PUT request to update the data
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data), // Send updated data to backend
            });
            const request = await response.json()
            if (!response.ok) {
                // throw new Error('Failed to update data');
                toast.error(response.message)
            }
            FetchUserData()
            toast(request.message)
            const result = await response.json();
            console.log("Update Success:", result); // Log success response
            setIsEditing(false); // Exit edit mode after saving

        } catch (error) {
            console.error("Error updating data:", error);
        }
    };
    const FetchUserData = async () => {
        try {
            const userdata = await fetch(`${baseUrl.baseUrl}api/admin/user/detailed/info/${id}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`,
                },
                credentials: "include",
            });

            if (!userdata.ok) {
                throw new Error('Failed to fetch data');
            }

            const userdetail = await userdata.json();

            // Extract only the required fields
            const selectedData = {
                username: userdetail.data.username || "",
                email: userdetail.data.email || "",
                phoneNumber: userdetail.data.phoneNumber || "000000000000",
                locCode: userdetail.data.locCode || "",
                empID: userdetail.data.empID || "",
                designation: userdetail.data.designation || "",
                workingBranch: userdetail.data.workingBranch || "",
            };
            setfullData(userdetail.data)
            setData(selectedData);
            console.log(selectedData); // Debugging: Check the fetched data

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    useEffect(() => {


        FetchUserData();
    }, [id]);

    // Handle Input Change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    return (
        <div className="mb-[70px]">
            <Header name="Employee" />
            <SideNav />
            <div>
                <div className="p-6 bg-white max-w-4xl mx-auto mt-32 text-black">
                    <Link to={'/employee'}>
                        <button className="text-gray-500 mb-4 flex items-center" onClick={() => setIsEditing(false)}>
                            <span className="mr-2">←</span> Back
                        </button>
                    </Link>
                    <h1 className="text-xl font-semibold text-gray-800 mb-6">Employee Details</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.keys(data)?.map((key, index) => (
                            <div className="flex flex-col" key={index}>
                                <label className="block text-sm font-medium text-[#016E5B]">
                                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name={key}
                                        value={data[key]} // Ensure default empty string to prevent React error
                                        onChange={handleChange}
                                        className="w-full bg-white flex rounded-md p-1 border-2"
                                    />
                                ) : (
                                    <p className="w-full flex text-center rounded-md p-1 border-2">
                                        {data[key]}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-8">
                        <div className="flex space-x-4">
                            <button
                                className="px-4 py-2 flex items-center gap-3 text-green-500 rounded-lg"
                                onClick={() => {
                                    if (isEditing) {
                                        handleSave(); // Call the save function when clicking "Save"
                                    }
                                    setIsEditing(!isEditing); // Toggle editing mode
                                }}
                            >
                                <GoPencil /> {isEditing ? "Save" : "Edit Profile"}
                            </button>

                            <p className="px-4 py-2 flex items-center gap-3 text-red-500 rounded-lg">
                                <FaRegTrashCan /> Delete Profile
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mx-32 overflow-x-auto text-black ">
                    <h4 className="text-2xl m-5">Training</h4>
                    <table className="w-full border-2 border-gray-300">
                        <thead>
                            <tr className="bg-[#016E5B] text-white">
                                <th className="px-3 py-1 border-2 border-gray-300">Training Name</th>
                                <th className="px-3 py-1 border-2 border-gray-300">No:modules</th>
                                <th className="px-3 py-1 border-2 border-gray-300">deadline</th>
                                <th className="px-3 py-1 border-2 border-gray-300">pass</th>
                                <th className="px-3 py-1 border-2 border-gray-300">status</th>

                            </tr>
                        </thead>
                        <tbody>
                            {fulldata?.training?.length > 0 ? (
                                fulldata?.training.map((employee, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-100">
                                        <td className="px-3 py-1 border-2 border-gray-300 text-center">#{employee.trainingId.trainingName}</td>
                                        <td className="px-3 py-1 border-2 border-gray-300 text-center">{employee.trainingId.modules.length}</td>
                                        <td className="px-3 py-1 border-2 border-gray-300 text-center">
                                            {new Date(employee.deadline).toLocaleDateString()}
                                        </td>
                                        <td className="px-3 py-1 border-2 border-gray-300 text-center">{employee.pass === true ? "pass" : "NOT pass"}</td>
                                        <td className="px-3 py-1 border-2 border-gray-300 text-center">{employee.status}</td>

                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-3">No data available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mx-32 overflow-x-auto text-black ">
                    <h4 className="text-2xl m-5">Assessments</h4>
                    <table className="w-full border-2 border-gray-300">
                        <thead>
                            <tr className="bg-[#016E5B] text-white">
                                <th className="px-3 py-1 border-2 border-gray-300">Assessments Name</th>
                                <th className="px-3 py-1 border-2 border-gray-300">No:modules</th>
                                <th className="px-3 py-1 border-2 border-gray-300">duration in minute</th>
                                <th className="px-3 py-1 border-2 border-gray-300">deadline</th>
                                <th className="px-3 py-1 border-2 border-gray-300">status</th>
                                <th className="px-3 py-1 border-2 border-gray-300">Score</th>


                            </tr>
                        </thead>
                        <tbody>
                            {fulldata?.assignedAssessments?.length > 0 ? (
                                fulldata?.assignedAssessments.map((employee, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-100">
                                        <td className="px-3 py-1 border-2 border-gray-300 text-center">#{employee.assessmentId.title}</td>
                                        <td className="px-3 py-1 border-2 border-gray-300 text-center">{employee.assessmentId.questions.length}</td>
                                        <td className="px-3 py-1 border-2 border-gray-300 text-center">
                                            {employee.assessmentId.duration}
                                        </td>
                                        <td className="px-3 py-1 border-2 border-gray-300 text-center">{new Date(employee.deadline).toLocaleDateString()}</td>
                                        <td className="px-3 py-1 border-2 border-gray-300 text-center">{employee.status}</td>
                                        <td className="px-3 py-1 border-2 border-gray-300 text-center">{employee.complete}</td>

                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-3">No data available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDetaileData;
