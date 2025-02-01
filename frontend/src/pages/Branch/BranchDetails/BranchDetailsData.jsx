import { useEffect, useState } from "react";
import Header from "../../../components/Header/Header";
import SideNav from "../../../components/SideNav/SideNav";
import { useParams } from "react-router-dom";
import baseUrl from "../../../api/api";
import { GoPencil } from "react-icons/go";
import { FaRegTrashCan } from "react-icons/fa6";

const BranchDetailsData = () => {
    const token = localStorage.getItem('token');
    const { id } = useParams();
    const [isEditing, setIsEditing] = useState(false);
    const [data, setData] = useState({});

    const FetchUserData = async () => {
        try {
            const response = await fetch(`${baseUrl.baseUrl}api/admin/get/update/branch/${id}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`,
                },
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }

            const branchdata = await response.json();
            const selectedData = {
                workingBranch: branchdata.branch.workingBranch || "",
                locCode: branchdata.branch.locCode || "",
                phoneNumber: branchdata.branch.phoneNumber || "",
                location: branchdata.branch.Location || "",
                address: branchdata.branch.address || "",
                manager: branchdata.branch.Manager || ""
            };
            setData(selectedData);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        FetchUserData();
    }, [id]);

    const handleChange = (e) => {
        setData({ ...data, [e.target.id]: e.target.value });
    };

    const handleSave = () => {
        console.log("Updated Data:", data);
        setIsEditing(false);
    };

    return (
        <div>
            <div className="mb-[70px]">
                <Header name='Edit Branch' />
                <SideNav />
                <div className="p-6 mt-[150px] mx-10 bg-gray-50 min-h-screen ml-[200px] text-[#016E5B]">
                    <button className="text-sm text-gray-500 hover:underline mb-4">Back</button>
                    <div className="grid grid-cols-2 gap-6">
                        {Object.keys(data).map((key) => (
                            <div key={key}>
                                <label htmlFor={key} className="block text-sm font-medium text-[#016E5B]">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </label>
                                {key === "address" ? (
                                    <textarea
                                        id={key}
                                        value={data[key]}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        rows={4}
                                        className="mt-1 block w-[300px] rounded-[5px] border shadow-sm bg-white border-gray-500 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    ></textarea>
                                ) : (
                                    <input
                                        id={key}
                                        type="text"
                                        value={data[key]}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="bg-white border-gray-500 h-10 mt-1 block w-[300px] rounded-[5px] border shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-8">
                        <div className="flex space-x-4">
                            <button
                                className="px-4 py-2 flex items-center gap-3 text-green-500 rounded-lg"
                                onClick={() => {
                                    if (isEditing) handleSave();
                                    setIsEditing(!isEditing);
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
            </div>
        </div>
    );
};

export default BranchDetailsData;
