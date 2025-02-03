import { useState } from "react";
import Header from "../../components/Header/Header";
import SideNav from "../../components/SideNav/SideNav";
import baseUrl from "../../api/api";
import { toast } from "react-toastify";

const BranchForm = () => {
    const [branch, setBranchData] = useState({
        address: "",
        locCode: "",
        location: "",
        manager: "",
        phoneNumber: "",
        workingBranch: ""
    });
    const token = localStorage.getItem('token');


    // Generalized function to handle all input changes dynamically
    const handleChange = (e) => {
        const { id, value } = e.target;
        setBranchData((prev) => ({
            ...prev,
            [id]: value
        }));
    };

    const handleFormSubmit = async () => {
        alert("Branch details saved!");
        console.log(branch);
        try {
            const response = await fetch(`${baseUrl.baseUrl}api/usercreate/create/branch`, {
                method: 'POST', // Assuming you use a PUT request to update the data
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(branch),
            })
            const result = await response.json();


            if (!response.ok) {
                toast.error(result.message || 'Failed to update data');
                return;
            }

        } catch (error) {
            throw new Error(error)
        }

    };

    return (
        <div className="mb-[70px]">
            <Header name="Add Branch" />
            <SideNav />
            <div className="p-6 mt-[150px] mx-10 bg-gray-50 min-h-screen ml-[200px] text-[#016E5B]">
                <button className="text-sm text-gray-500 hover:underline mb-4">Back</button>

                <div className="grid grid-cols-2 gap-6">
                    {/* Branch ID (Not controlled since no state for it) */}
                    <div>
                        <label htmlFor="locCode" className="block text-sm font-medium text-[#016E5B]">
                            Branch ID
                        </label>
                        <input
                            id="locCode"
                            type="text"
                            placeholder="Enter Branch ID"
                            value={branch.locCode}
                            onChange={handleChange}
                            className="bg-white border-gray-500 h-10 mt-1 block w-[300px] rounded-[5px] border shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        />
                    </div>

                    {/* Branch Manager */}
                    <div>
                        <label htmlFor="manager" className="block text-sm font-medium text-[#016E5B]">
                            Branch Manager
                        </label>
                        <input
                            id="manager"
                            type="text"
                            value={branch.manager}
                            onChange={handleChange}
                            placeholder="Enter Branch Manager"
                            className="bg-white border-gray-500 h-10 mt-1 block w-[300px] rounded-[5px] border shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        />
                    </div>

                    {/* Branch Name */}
                    <div>
                        <label htmlFor="workingBranch" className="block text-sm font-medium text-[#016E5B]">
                            Branch Name
                        </label>
                        <input
                            id="workingBranch"
                            type="text"
                            value={branch.workingBranch}
                            onChange={handleChange}
                            placeholder="Enter Branch Name"
                            className="bg-white border-gray-500 h-10 mt-1 block w-[300px] rounded-[5px] border shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        />
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-[#016E5B]">
                            Phone Number
                        </label>
                        <input
                            id="phoneNumber"
                            type="text"
                            value={branch.phoneNumber}
                            onChange={handleChange}
                            placeholder="Enter Branch Phone Number"
                            className="bg-white border-gray-500 h-10 mt-1 block w-[300px] rounded-[5px] border shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        />
                    </div>

                    {/* Branch Location */}
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-[#016E5B]">
                            Branch Location
                        </label>
                        <input
                            id="location"
                            type="text"
                            value={branch.location}
                            onChange={handleChange}
                            placeholder="Enter Branch Location"
                            className="bg-white border-gray-500 h-10 mt-1 block w-[300px] rounded-[5px] border shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        />
                    </div>

                    {/* Branch Address */}
                    <div className="col-span-2 w-[630px]">
                        <label htmlFor="address" className="block text-sm font-medium text-[#016E5B]">
                            Branch Address
                        </label>
                        <textarea
                            id="address"
                            value={branch.address}
                            onChange={handleChange}
                            rows={7}
                            placeholder="Enter Branch Address"
                            className="mt-1 block w-[250px] rounded-[5px] border shadow-sm bg-white border-gray-500 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        ></textarea>
                    </div>

                    {/* Save Button */}
                    <div className="mt-6">
                        <button
                            className="bg-green-600 text-white px-6 py-2 rounded-[5px] shadow hover:bg-green-700"
                            onClick={handleFormSubmit}
                        >
                            Save Branch
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BranchForm;
