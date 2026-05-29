import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import baseUrl from "../../api/api";
import { toast } from "react-toastify";
import { FaArrowLeft } from "react-icons/fa";

const CreateCustomNotification = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Form states
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedOption, setSelectedOption] = useState("branch"); // Matches default 'Store' in mockup
  const [assignedTo, setAssignedTo] = useState([]); // Array of { value, label } options
  const [deadline, setDeadline] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("inApp"); // Matches default 'In App Notification'
  
  // Data options fetched from API
  const [recipientsOptions, setRecipientsOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [sending, setSending] = useState(false);

  // Fetch options based on recipient type (user, branch, designation)
  useEffect(() => {
    if (selectedOption === "all_employees") {
      setRecipientsOptions([]);
      setAssignedTo([]);
      return;
    }

    const fetchOptions = async () => {
      setLoadingOptions(true);
      try {
        let options = [];

        if (selectedOption === "user") {
          // Fetch employees (Individual)
          const response = await fetch(`${baseUrl.baseUrl}api/usercreate/getAllUser`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            credentials: "include",
          });

          if (response.ok) {
            const data = await response.json();
            options = data.data.map((item) => ({
              value: item._id,
              label: `${item.username} (${item.empID})`,
            }));
          }
        } else if (selectedOption === "branch") {
          // Fetch branches (Store)
          const response = await fetch(`${baseUrl.baseUrl}api/usercreate/getBranch`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            credentials: "include",
          });

          if (response.ok) {
            const data = await response.json();
            options = data.data.map((item) => ({
              value: item.locCode,
              label: item.workingBranch,
            }));
          }
        } else if (selectedOption === "designation") {
          // Fetch designations (Role)
          const response = await fetch(`${baseUrl.baseUrl}api/employee_range`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ startEmpId: "EMP1", endEmpId: "EMP9999" }),
          });

          if (response.ok) {
            const data = await response.json();
            const uniqueDesignations = [...new Set(
              (data?.data || [])
                .map(emp => emp.role_name)
                .filter(Boolean)
            )].sort();

            options = uniqueDesignations.map((designation) => ({
              value: designation,
              label: designation,
            }));
          }
        }

        setRecipientsOptions(options);
      } catch (error) {
        console.error("Error loading recipient options:", error);
        toast.error("Failed to load options.");
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
    setAssignedTo([]); // Clear selected options when recipient type changes
  }, [selectedOption, token]);

  const handleSelectChange = (selectedOptions) => {
    setAssignedTo(selectedOptions || []);
  };

  const handleRemovePill = (valueToRemove) => {
    setAssignedTo((prev) => prev.filter((item) => item.value !== valueToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.warning("Please enter a notification title.");
      return;
    }
    if (!message.trim()) {
      toast.warning("Please enter the message content.");
      return;
    }
    if (selectedOption !== "all_employees" && assignedTo.length === 0) {
      toast.warning(`Please select at least one recipient ${selectedOption === "branch" ? "store" : selectedOption === "designation" ? "role" : "employee"}.`);
      return;
    }
    if (!deadline) {
      toast.warning("Please select a deadline.");
      return;
    }

    setSending(false);
    try {
      // Determine final recipient payload
      let finalRecipient = [];
      let finalRole = selectedOption;

      if (selectedOption === "all_employees") {
        // If All Employees, fetch and pass all user IDs
        setSending(true);
        const res = await fetch(`${baseUrl.baseUrl}api/usercreate/getAllUser`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const json = await res.json();
          finalRecipient = (json.data || []).map(u => u._id);
          finalRole = "user"; // Save in user notification array
        } else {
          throw new Error("Failed to fetch all employees to send notifications.");
        }
      } else {
        finalRecipient = assignedTo.map(item => item.value);
      }

      const payload = {
        title,
        message,
        recipient: finalRecipient,
        role: finalRole,
        deliveryMethod,
        deadline,
      };

      const response = await fetch(`${baseUrl.baseUrl}api/admin/notification/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || "Failed to send notification.");
      }

      toast.success(json.message || "Notification sent successfully!");
      
      // Reset form
      setTitle("");
      setMessage("");
      setAssignedTo([]);
      setDeadline("");
    } catch (error) {
      toast.error(error.message || "An error occurred while sending notification.");
    } finally {
      setSending(false);
    }
  };

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderRadius: "12px",
      borderColor: state.isFocused ? "#000" : "#e5e7eb",
      boxShadow: state.isFocused ? "0 0 0 1px #000" : "none",
      minHeight: "45px",
      fontSize: "14px",
      backgroundColor: "#fff",
      "&:hover": {
        borderColor: "#000",
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "2px 12px",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#9ca3af",
    }),
  };

  return (
    <div className="flex flex-col min-h-screen text-gray-800">
      {/* Main card matching settings/create user layout */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-6xl w-full mx-auto">
        {/* Header with inline back arrow */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/settings/users"
            className="text-gray-900 hover:text-black transition-colors"
          >
            <FaArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Create Custom Notification</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Title and Message Content side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Title */}
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-2">
                Notification Title/ Subject<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter notification title, subject"
                className="w-full h-[45px] px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition-all bg-white text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Right: Message Content */}
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-2">
                Message Content<span className="text-red-500">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                rows="1"
                className="w-full h-[45px] px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition-all bg-white text-gray-900 placeholder-gray-400 resize-none"
              ></textarea>
            </div>
          </div>

          {/* Row 2: Assign to */}
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-3">
              Assign to <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-12 items-center">
              <label className="flex items-center gap-3 text-sm text-gray-800 cursor-pointer">
                <input
                  type="radio"
                  name="assignTo"
                  value="all_employees"
                  checked={selectedOption === "all_employees"}
                  onChange={() => setSelectedOption("all_employees")}
                  className="w-4 h-4 border-gray-300 text-black focus:ring-black accent-black"
                />
                <span>All Employees</span>
              </label>
              <label className="flex items-center gap-3 text-sm text-gray-800 cursor-pointer">
                <input
                  type="radio"
                  name="assignTo"
                  value="branch"
                  checked={selectedOption === "branch"}
                  onChange={() => setSelectedOption("branch")}
                  className="w-4 h-4 border-gray-300 text-black focus:ring-black accent-black"
                />
                <span>Store</span>
              </label>
              <label className="flex items-center gap-3 text-sm text-gray-800 cursor-pointer">
                <input
                  type="radio"
                  name="assignTo"
                  value="designation"
                  checked={selectedOption === "designation"}
                  onChange={() => setSelectedOption("designation")}
                  className="w-4 h-4 border-gray-300 text-black focus:ring-black accent-black"
                />
                <span>Role</span>
              </label>
              <label className="flex items-center gap-3 text-sm text-gray-800 cursor-pointer">
                <input
                  type="radio"
                  name="assignTo"
                  value="user"
                  checked={selectedOption === "user"}
                  onChange={() => setSelectedOption("user")}
                  className="w-4 h-4 border-gray-300 text-black focus:ring-black accent-black"
                />
                <span>Individual</span>
              </label>
            </div>
          </div>

          {/* Row 3: Dropdown Selection + Deadline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Conditional Dropdown Selection */}
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-2">
                {selectedOption === "branch"
                  ? "Stores"
                  : selectedOption === "designation"
                  ? "Roles"
                  : "Employees"}
                <span className="text-red-500">*</span>
              </label>
              {selectedOption === "all_employees" ? (
                <div className="w-full h-[45px] px-4 border border-gray-100 bg-gray-50 text-gray-400 rounded-xl text-sm flex items-center">
                  All Employees selected
                </div>
              ) : (
                <Select
                  placeholder={
                    selectedOption === "branch"
                      ? "Select Stores user can access"
                      : selectedOption === "designation"
                      ? "Select roles"
                      : "Select employees"
                  }
                  options={recipientsOptions}
                  isMulti
                  value={assignedTo}
                  onChange={handleSelectChange}
                  styles={customSelectStyles}
                  isLoading={loadingOptions}
                />
              )}
            </div>

            {/* Right: Deadline */}
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-2">
                Deadline<span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full h-[45px] px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition-all bg-white text-gray-900"
              />
            </div>
          </div>

          {/* Row 4: Assigned pills + Delivery Method */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left: Assigned pills */}
            <div>
              {selectedOption !== "all_employees" && assignedTo.length > 0 && (
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    ASSIGNED TO
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {assignedTo.map((item) => (
                      <span
                        key={item.value}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600 shadow-sm"
                      >
                        {item.label}
                        <button
                          type="button"
                          onClick={() => handleRemovePill(item.value)}
                          className="text-gray-400 hover:text-red-500 transition-colors font-bold text-sm"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Delivery Method */}
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-3">
                Delivery Method<span className="text-red-500">*</span>
              </label>
              <div className="flex gap-12 items-center">
                <label className="flex items-center gap-3 text-sm text-gray-800 cursor-pointer">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="email"
                    checked={deliveryMethod === "email"}
                    onChange={() => setDeliveryMethod("email")}
                    className="w-4 h-4 border-gray-300 text-black focus:ring-black accent-black"
                  />
                  <span>Email</span>
                </label>
                <label className="flex items-center gap-3 text-sm text-gray-800 cursor-pointer">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="inApp"
                    checked={deliveryMethod === "inApp"}
                    onChange={() => setDeliveryMethod("inApp")}
                    className="w-4 h-4 border-gray-300 text-black focus:ring-black accent-black"
                  />
                  <span>In App Notification</span>
                </label>
              </div>
            </div>
          </div>

          {/* Row 5: Action Button */}
          <div className="pt-4 flex justify-start">
            <button
              type="submit"
              disabled={sending}
              className="px-6 py-3 bg-[#111] hover:bg-black text-white font-semibold text-sm rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send Notification"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCustomNotification;
