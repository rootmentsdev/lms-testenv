import Header from "../../components/Header/Header";
import SideNav from "../../components/SideNav/SideNav";

const BranchForm = () => {
    return (
        <div className="mb-[70px]">



            <div><Header name='Add Branch ' /></div>
            <SideNav />
            <div className="p-6 mt-[150px] mx-10 bg-gray-50 min-h-screen  ml-[200px] text-[#016E5B]">
                <button className="text-sm text-gray-500 hover:underline mb-4">Back</button>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="branchID" className="block text-sm font-medium text-[#016E5B]">
                            Branch ID
                        </label>
                        <input
                            id="branchID"
                            type="text"
                            placeholder="Enter Branch id"
                            className=" bg-white border-gray-500 h-10 mt-1 block w-[300px] rounded-[5px] border shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="branchManager" className="block text-sm font-medium text-[#016E5B]">
                            Branch Manager
                        </label>
                        <input
                            id="branchManager"
                            type="text"
                            placeholder="Enter branch Manager"
                            className=" bg-white border-gray-500 h-10 mt-1 block w-[300px] rounded-[5px] border shadow-sm focus:ring-green-500  focus:border-green-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="branchName" className="block text-sm font-medium text-[#016E5B]">
                            Branch Name
                        </label>
                        <input
                            id="branchName"
                            type="text"
                            placeholder="Enter branch name"
                            className=" bg-white border-gray-500 h-10 mt-1 block w-[300px] rounded-[5px] border shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-[#016E5B]">
                            Phone Number
                        </label>
                        <input
                            id="phoneNumber"
                            type="text"
                            placeholder="Enter branch phone number"
                            className=" bg-white border-gray-500 h-10 mt-1 block w-[300px] rounded-[5px] border shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="branchLocation" className="block text-sm font-medium text-[#016E5B]">
                            Branch Location
                        </label>
                        <input
                            id="branchLocation"
                            type="text"
                            placeholder="Enter branch location"
                            className=" bg-white border-gray-500 h-10 mt-1 block w-[300px] rounded-[5px] border shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        />
                    </div>
                    <div className="col-span-2 w-[630px]">
                        <label htmlFor="branchAddress" className="block text-sm font-medium text-[#016E5B]">
                            Branch Address
                        </label>
                        <textarea
                            id="branchAddress"
                            rows={7}
                            placeholder="Enter branch address"
                            className="mt-1 block w-[250px] rounded-[5px] border shadow-sm bg-white border-gray-500 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        ></textarea>
                    </div>
                    <div className="mt-6">
                        <button className="bg-green-600 text-white px-6 py-2 rounded-[5px] shadow hover:bg-green-700">
                            Save Branch
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BranchForm;
