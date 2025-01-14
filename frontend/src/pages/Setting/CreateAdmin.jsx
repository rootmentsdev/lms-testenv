import { useEffect, useState } from "react";
import baseUrl from "../../api/api";
import Select from "react-select";

const CreateUser = () => {
  const [users, setUsers] = useState([]);
  const [assignedTo, setAssignedTo] = useState([]); // Fixed missing state
  const [selectedOption, setSelectedOption] = useState("user");

  const [form, setForm] = useState({
    userId: "",
    userName: "",
    email: "",
    userRole: "clusterManager",
    clusterBranch: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("User Form Data:", form);
    console.log("Assigned To:", assignedTo);
    // Add your form submission logic here
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const endpoint = "api/usercreate/getBranch";


        const response = await fetch(`${baseUrl.baseUrl}${endpoint}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        const data = await response.json();

        const options = data.data.map((item) => ({
          value: item.locCode,
          label: item.workingBranch
        }));
        setUsers(options);
      } catch (error) {
        console.error("Failed to fetch users:", error.message);
      }
    };

    fetchUsers();
  }, [selectedOption]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex text-black justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Create User/Admin</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User ID */}
          <div>
            <label htmlFor="userId" className="block text-sm font-semibold text-gray-700">
              User ID
            </label>
            <input
              type="text"
              id="userId"
              name="userId"
              value={form.userId}
              onChange={handleInputChange}
              placeholder="Enter employee ID"
              className="mt-2 block w-full p-2 border bg-white border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* User Name */}
          <div>
            <label htmlFor="userName" className="block text-sm font-semibold text-gray-700">
              User Name
            </label>
            <input
              type="text"
              id="userName"
              name="userName"
              value={form.userName}
              onChange={handleInputChange}
              placeholder="Enter employee name"
              className="mt-2 block w-full p-2 border bg-white border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleInputChange}
              placeholder="Enter employee email address"
              className="mt-2 block w-full p-2 border bg-white border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Assign To */}
          <div className="flex flex-col gap-4">
            <label htmlFor="assignToType" className="block text-gray-700 font-medium">
              Role
            </label>
            <div className="flex gap-5">
              <label>
                <input
                  type="radio"
                  value="user"
                  checked={selectedOption === "user"}
                  onChange={() => setSelectedOption("user")}
                />{" "}
                Super Admin
              </label>
              <label>
                <input
                  type="radio"
                  value="designation"
                  checked={selectedOption === "designation"}
                  onChange={() => setSelectedOption("designation")}
                />{" "}
                Cluster Manager
              </label>
              <label>
                <input
                  type="radio"
                  value="branch"
                  checked={selectedOption === "branch"}
                  onChange={() => setSelectedOption("branch")}
                />{" "}
                Store Manager
              </label>
            </div>
            {selectedOption === "user" ? null : (
              <Select
                placeholder="Select the users"
                id="assignToUsers"
                options={users}
                isMulti={selectedOption === "designation"} // Properly sets isMulti based on selectedOption
                value={assignedTo}
                onChange={setAssignedTo}
                className="w-full"
              />
            )}

          </div>

          {/* Save Button */}
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300"
            >
              Save User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
