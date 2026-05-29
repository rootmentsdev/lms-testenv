import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiArrowLeft, FiClock, FiBook } from "react-icons/fi";
import baseUrl from "../../../api/api";
import SideNav from "../../../components/SideNav/SideNav";

const ASSIGN_OPTIONS = [
  { value: "all", label: "All Employees" },
  { value: "designation", label: "Role" },
  { value: "user", label: "Individual" },
  { value: "new", label: "New Employees" },
];

const TRAINING_TYPES = [
  { value: "Assigned", label: "Assigned" },
  { value: "Mandatory", label: "Mandatory" },
];

const CATEGORY_OPTIONS = [
  { value: "Onboarding", label: "Onboarding" },
  { value: "Compliance", label: "Compliance" },
  { value: "Technical", label: "Technical" },
  { value: "Soft Skills", label: "Soft Skills" },
  { value: "Leadership", label: "Leadership" },
  { value: "Product", label: "Product" },
  { value: "Other", label: "Other" },
];

const getModuleId = (module) => module?._id || module?.moduleId || module?.id;

const CreateTrainingDatas = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Form state
  const [trainingName, setTrainingName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [trainingType, setTrainingType] = useState("Assigned");
  const [assignType, setAssignType] = useState("all");
  const [assignedTo, setAssignedTo] = useState([]);
  const [assignOptions, setAssignOptions] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedModules, setSelectedModules] = useState([]);
  const [days, setDays] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch modules
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await fetch(`${baseUrl.baseUrl}api/modules`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        setModules(data);
      } catch (_) {}
    };
    fetchModules();
  }, []);

  // Fetch assign-to options based on assignType
  useEffect(() => {
    if (assignType === "all" || assignType === "new") {
      setAssignOptions([]);
      setAssignedTo([]);
      return;
    }

    const fetchOptions = async () => {
      try {
        const res = await fetch(
          `${baseUrl.baseUrl}api/employee/app-users?page=1&limit=500`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) return;
        const data = await res.json();
        const employees = Array.isArray(data?.data) ? data.data : [];

        if (assignType === "user") {
          setAssignOptions(
            employees.map((e) => ({
              value: e.empID,
              label: `${e.empID || "N/A"} — ${e.username || "N/A"} (${e.designation || "N/A"})`,
            }))
          );
        } else if (assignType === "designation") {
          const unique = [...new Set(employees.map((e) => e.designation).filter(Boolean))];
          setAssignOptions(unique.map((r) => ({ value: r, label: r })));
        }
      } catch (_) {}
    };

    fetchOptions();
    setAssignedTo([]);
  }, [assignType, token]);

  const toggleModule = (mod) => {
    const moduleId = getModuleId(mod);
    if (!moduleId) return;

    setSelectedModules((prev) =>
      prev.some((m) => getModuleId(m) === moduleId)
        ? prev.filter((m) => getModuleId(m) !== moduleId)
        : [...prev, mod]
    );
  };

  const handleSubmit = async () => {
    if (!trainingName.trim()) return toast.error("Training title is required");
    if (!category) return toast.error("Please select a category");
    if (!days || Number(days) <= 0) return toast.error("Please enter valid number of days");
    if (selectedModules.length === 0) return toast.error("Please select at least one module");

    // Build assignedfor array
    let assignedfor = [];
    if (assignType === "all") assignedfor = ["All"];
    else if (assignType === "new") assignedfor = ["New"];
    else assignedfor = assignedTo.map((x) => x.value);

    if ((assignType === "user" || assignType === "designation") && assignedfor.length === 0) {
      return toast.error("Please select at least one assignee");
    }

    const moduleIds = selectedModules.map(getModuleId).filter(Boolean);
    if (moduleIds.length === 0) return toast.error("Please select a valid module");

    const payload = {
      trainingName: trainingName.trim(),
      description: description.trim(),
      modules: moduleIds,
      days: Number(days),
      deadline: Number(days),
      Trainingtype: trainingType,
      Assignedfor: assignedfor,
      selectedOption: assignType,
      workingBranch: assignedfor,
      category,
    };

    try {
      setLoading(true);
      const res = await fetch(`${baseUrl.baseUrl}api/trainings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("Create training failed:", { status: res.status, data, payload });
        return toast.error(data.details || data.error || data.message || "Failed to create training");
      }
      toast.success(data.message || "Training created successfully!");
      navigate(-1);
    } catch (_) {
      toast.error("Error submitting training.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
      <SideNav />

      <div className="flex-1 md:ml-[120px] p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-1 hover:bg-gray-200 rounded-full transition"
            >
              <FiArrowLeft size={22} />
            </button>
            <h1 className="text-[22px] font-bold leading-tight text-gray-900">Create New Training</h1>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Training"}
          </button>
        </div>

        {/* Top form card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-5">
          {/* Row 1: Title, Category, Description */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Training Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Training title"
                value={trainingName}
                onChange={(e) => setTrainingName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
              >
                <option value="">Select Category</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                placeholder="Enter Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
          </div>

          {/* Row 2: Days, Training Type, Assign To */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deadline (Days) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="Number of days"
                value={days}
                min={1}
                onChange={(e) => setDays(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>

            {/* Training Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Training Type <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4 mt-1">
                {TRAINING_TYPES.map((t) => (
                  <label key={t.value} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="trainingType"
                      value={t.value}
                      checked={trainingType === t.value}
                      onChange={() => setTrainingType(t.value)}
                      className="accent-gray-900"
                    />
                    {t.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Assign To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {ASSIGN_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="assignType"
                      value={opt.value}
                      checked={assignType === opt.value}
                      onChange={() => setAssignType(opt.value)}
                      className="accent-gray-900"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Conditional assignee selector */}
          {(assignType === "user" || assignType === "designation") && (
            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select {assignType === "user" ? "Employees" : "Roles"}
              </label>
              <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto bg-gray-50">
                {assignOptions.length === 0 ? (
                  <p className="text-sm text-gray-400">Loading options...</p>
                ) : (
                  assignOptions.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 py-1 cursor-pointer text-sm hover:bg-gray-100 px-1 rounded">
                      <input
                        type="checkbox"
                        checked={assignedTo.some((a) => a.value === opt.value)}
                        onChange={() =>
                          setAssignedTo((prev) =>
                            prev.some((a) => a.value === opt.value)
                              ? prev.filter((a) => a.value !== opt.value)
                              : [...prev, opt]
                          )
                        }
                        className="accent-gray-900"
                      />
                      {opt.label}
                    </label>
                  ))
                )}
              </div>
              {assignedTo.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">{assignedTo.length} selected</p>
              )}
            </div>
          )}
        </div>

        {/* Modules card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Select training Modules</h2>

          {modules.length === 0 ? (
            <p className="text-sm text-gray-400">No modules available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.filter(getModuleId).map((mod) => {
                const moduleId = getModuleId(mod);
                const isSelected = selectedModules.some((m) => getModuleId(m) === moduleId);
                const videoCount = mod.videos?.length ?? 0;
                // Estimate duration: assume ~15 mins per video
                const totalMins = videoCount * 15;
                const hrs = Math.floor(totalMins / 60).toString().padStart(2, "0");
                const mins = (totalMins % 60).toString().padStart(2, "0");

                return (
                  <div
                    key={moduleId}
                    onClick={() => toggleModule(mod)}
                    className={`flex items-start gap-3 border rounded-2xl p-4 cursor-pointer transition-all ${
                      isSelected
                        ? "border-gray-900 bg-gray-50 shadow-sm"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {/* Checkbox */}
                    <div
                      className={`mt-0.5 w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
                        isSelected ? "bg-gray-900 border-gray-900" : "border-gray-400"
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{mod.moduleName}</p>
                      <div className="flex items-center gap-4 mt-1.5 text-gray-500 text-xs">
                        <span className="flex items-center gap-1">
                          <FiClock size={12} />
                          {hrs} hr {mins} mins
                        </span>
                        <span className="flex items-center gap-1">
                          <FiBook size={12} />
                          {videoCount} {videoCount === 1 ? "Video" : "Videos"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {selectedModules.length > 0 && (
            <p className="text-xs text-gray-500 mt-4">
              {selectedModules.length} module{selectedModules.length > 1 ? "s" : ""} selected
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateTrainingDatas;
