import Header from "../../components/Header/Header";
import SideNav from "../../components/SideNav/SideNav";

const BranchForm = () => {
    return (
        <div className="mb-[70px]">



            <div><Header name='Add Branch ' /></div>
            <SideNav />
            <div className="p-6 bg-gray-50 min-h-screen mx-6 ml-[100px] text-[#016E5B] font-bold">
                <button className="text-sm text-gray-500 hover:underline mb-4">Back</button>
                <div className="bg-white shadow-md rounded-lg p-6 mt-[100px]">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="branchID" className="block text-sm font-medium text-gray-700">
                                Branch ID
                            </label>
                            <input
                                id="branchID"
                                type="text"
                                placeholder="Enter Branch id"
                                className=" bg-white border-gray-500 h-10 mt-1 block w-full rounded-md border shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="branchManager" className="block text-sm font-medium text-gray-700">
                                Branch Manager
                            </label>
                            <input
                                id="branchManager"
                                type="text"
                                placeholder="Enter branch Manager"
                                className=" bg-white border-gray-500 h-10 mt-1 block w-full rounded-md border shadow-sm focus:ring-green-500  focus:border-green-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="branchName" className="block text-sm font-medium text-gray-700">
                                Branch Name
                            </label>
                            <input
                                id="branchName"
                                type="text"
                                placeholder="Enter branch name"
                                className=" bg-white border-gray-500 h-10 mt-1 block w-full rounded-md border shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                                Phone Number
                            </label>
                            <input
                                id="phoneNumber"
                                type="text"
                                placeholder="Enter branch phone number"
                                className=" bg-white border-gray-500 h-10 mt-1 block w-full rounded-md border shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="branchLocation" className="block text-sm font-medium text-gray-700">
                                Branch Location
                            </label>
                            <input
                                id="branchLocation"
                                type="text"
                                placeholder="Enter branch location"
                                className=" bg-white border-gray-500 h-10 mt-1 block w-full rounded-md border shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                        </div>
                        <div className="col-span-2 w-[630px]">
                            <label htmlFor="branchAddress" className="block text-sm font-medium text-gray-700">
                                Branch Address
                            </label>
                            <textarea
                                id="branchAddress"
                                placeholder="Enter branch address"
                                className="mt-1 block w-full rounded-md border shadow-sm bg-white border-gray-500 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            ></textarea>
                        </div>
                    </div>
                    <div className="mt-6">
                        <button className="bg-green-600 text-white px-6 py-2 rounded-md shadow hover:bg-green-700">
                            Save Branch
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BranchForm;
