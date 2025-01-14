import { useEffect, useState } from "react";
import Select from "react-select";
import baseUrl from "../../api/api";

const CreateCustomNotification = () => {


  // const [modules, setModules] = useState([]);
  const [users, setUsers] = useState([]);
  // const [selectedModules, setSelectedModules] = useState([]);
  const [assignedTo, setAssignedTo] = useState([]); // Fixed missing state
  // const [days, setDays] = useState(""); // Track input days
  const [selectedOption, setSelectedOption] = useState("user");
  // const [Reassign, setReassign] = useState(true);
  const [form, setForm] = useState({
    title: "",
    message: "",
    recipient: "specificRole",
    role: "",
    deliveryMethod: "email",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const endpoint =
          selectedOption === "user"
            ? "api/usercreate/getAllUser"
            : selectedOption === "branch"
              ? "api/usercreate/getBranch"
              : "api/usercreate/getAll/designation";

        const response = await fetch(`${baseUrl.baseUrl}${endpoint}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        const data = await response.json();

        const options = data.data.map((item) => ({
          value: selectedOption === "branch" ? item.locCode : item._id || item.designation,
          label: selectedOption === "branch" ? item.workingBranch : item.username || item.designation,
        }));
        setUsers(options);
      } catch (error) {
        console.error("Failed to fetch users:", error.message);
      }
    };
    fetchUsers();
  }, [selectedOption]);


  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Notification Form Data:", form);
    // Add your form submission logic here
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-black flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Create Custom Notification</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Notification Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-gray-700"
            >
              Notification Title/ Subject
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={form.title}
              onChange={handleInputChange}
              placeholder="Enter notification title / subject"
              className="mt-2 block w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Message Content */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-semibold text-gray-700"
            >
              Message Content
            </label>
            <textarea
              id="message"
              name="message"
              value={form.message}
              onChange={handleInputChange}
              placeholder="Type your message here..."
              rows="4"
              className="mt-2 block w-full p-2 border bg-white border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            ></textarea>
          </div>


          {/* Recipient Selection */}

          <div className="flex flex-col gap-4">
            <label htmlFor="assignToType" className="block text-gray-700 font-medium">
              Assign To
            </label>
            <div className="flex gap-5">
              <label>
                <input
                  type="radio"
                  value="user"
                  checked={selectedOption === "user"}
                  onChange={() => setSelectedOption("user")}
                />{" "}
                User
              </label>
              <label>
                <input
                  type="radio"
                  value="designation"
                  checked={selectedOption === "designation"}
                  onChange={() => setSelectedOption("designation")}
                />{" "}
                Designation
              </label>
              <label>
                <input
                  type="radio"
                  value="branch"
                  checked={selectedOption === "branch"}
                  onChange={() => setSelectedOption("branch")}
                />{" "}
                Branch
              </label>
            </div>
            <Select
              placeholder="Select the users"
              id="assignToUsers"
              options={users}
              isMulti
              value={assignedTo}
              onChange={setAssignedTo}
              className="w-full"
            />
          </div>
          {/* Delivery Methods */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Delivery Methods
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="email"
                  checked={form.deliveryMethod === "email"}
                  onChange={handleInputChange}
                  className="focus:ring-green-500 text-green-600 border-gray-300"
                />
                <span>Email</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="inApp"
                  checked={form.deliveryMethod === "inApp"}
                  onChange={handleInputChange}
                  className="focus:ring-green-500 text-green-600 border-gray-300"
                />
                <span>In-app Notification</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300"
            >
              Send Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCustomNotification;
