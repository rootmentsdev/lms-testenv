
// import { useEffect, useState } from "react";
// import Select from "react-select"; // Import react-select
// import baseUrl from "../../../api/api";
// import Header from "../../../components/Header/Header";
// import { toast } from "react-toastify";
// import SideNav from "../../../components/SideNav/SideNav";

// const Mandatorytrainingdata = () => {
//     const [modules, setModules] = useState([]); // Module options
//     const [users, setUsers] = useState([]);     // Users options
//     const [trainingName, setTrainingName] = useState("");
//     const [assignedTo, setAssignedTo] = useState([]); // Multi-select values
//     const [selectedModules, setSelectedModules] = useState([]); // Multi-select values
//     const [days, setDays] = useState("");
//     const token = localStorage.getItem('token');

//     // Fetch Modules
//     useEffect(() => {
//         const fetchModules = async () => {
//             try {
//                 const response = await fetch(`${baseUrl.baseUrl}api/modules`, {
//                     method: "GET",
//                     headers: { "Content-Type": "application/json" },
//                     credentials: "include",
//                 });

//                 if (!response.ok) {
//                     throw new Error(`Error: ${response.statusText}`);
//                 }

//                 const data = await response.json();
//                 console.log(data);

//                 // Map modules to options required by react-select
//                 const options = data.map((module) => ({
//                     value: module.moduleId,
//                     label: module.moduleName,
//                 }));

//                 setModules(options);
//             } catch (error) {
//                 console.error("Failed to fetch modules:", error.message);
//             }
//         };

//         const fetchUsers = async () => {
//             try {
//                 const endpoint = "api/usercreate/getAll/designation";
//                 const response = await fetch(`${baseUrl.baseUrl}${endpoint}`, {
//                     method: "GET",
//                     headers: {
//                         "Content-Type": "application/json",
//                         'Authorization': `Bearer ${token}`,
//                     },
//                     credentials: "include",
//                 });

//                 if (!response.ok) {
//                     throw new Error(`Error: ${response.statusText}`);
//                 }

//                 const data = await response.json();
//                 console.log(data);

//                 // Map users to options required by react-select


//                 const options = data.data.map((user) => ({
//                     value: user.designation,
//                     label: user.designation,
//                 }));
//                 setUsers(options);

//             } catch (error) {
//                 console.error("Failed to fetch users:", error.message);
//             }
//         };

//         fetchModules();
//         fetchUsers();
//     }, []);

//     // Submit handler
//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         const trainingData = {
//             trainingName,
//             workingBranch: assignedTo.map((item) => item.value), // Extract values
//             modules: selectedModules.map((item) => item.value), // Extract values
//             days,

//         };
//         try {
//             console.log(trainingData); // Log final data for submission
//             toast("Form Submitted Successfully!");
//             // POST request (uncomment to use)
//             const response = await fetch(`${baseUrl.baseUrl}api/mandatorytrainings`, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     'Authorization': `Bearer ${token}`,
//                 },
//                 body: JSON.stringify(trainingData),
//             });
//             const data = await response.json();
//             toast.success(data.message);
//         } catch (error) {
//             console.error("Failed to submit training:", error.message);
//             toast.error("Error submitting training.");
//         }
//     };

//     return (
//         <div>
//             <div className="w-full h-full bg-white">
//                 <Header name="Mandatory training" />
//             </div>
//             <SideNav />
//             <div className="md:ml-[100px] mt-[150px]">
//                 <form onSubmit={handleSubmit} className="text-black w-[800px] mt-10">
//                     {/* Training Name */}
//                     <div className="flex flex-col gap-5 mx-20 mt-5">
//                         <div className="flex flex-col gap-5">
//                             <p>Training Name</p>
//                             <input
//                                 type="text"
//                                 placeholder="Training title"
//                                 className="bg-white border p-1 w-full rounded-lg border-black"
//                                 value={trainingName}
//                                 onChange={(e) => setTrainingName(e.target.value)}
//                                 required
//                             />
//                         </div>
//                     </div>

//                     {/* Days */}
//                     <div className="flex flex-col gap-5 mx-20 mt-5">
//                         <div className="flex flex-col gap-5">
//                             <p>Days</p>
//                             <input
//                                 type="number"
//                                 placeholder="Number of days"
//                                 className="bg-white w-full border p-1 rounded-lg border-black"
//                                 value={days}
//                                 onChange={(e) => setDays(e.target.value)}
//                                 required
//                             />
//                         </div>
//                     </div>

//                     {/* Modules Dropdown */}
//                     <div className="flex flex-col gap-5 mx-20 mt-5">
//                         <p>Modules</p>
//                         <Select
//                             options={modules}
//                             isMulti
//                             value={selectedModules}
//                             onChange={setSelectedModules} // Updates state
//                             className="w-full"
//                         />
//                     </div>

//                     {/* Assign To Dropdown */}
//                     <div className="flex flex-col gap-1 mx-20 mt-5">
//                         <p>Assign To Designation</p>
//                         <div className="flex flex-col gap-5 mx-20 mt-5">
//                             {/* <div className="flex gap-5">
//                                 <label>
//                                     <input
//                                         type="radio"
//                                         value="user"
//                                         checked={selectedOption === "user"}
//                                         onChange={() => setSelectedOption("user")}
//                                     /> User
//                                 </label>
//                                 <label>
//                                     <input
//                                         type="radio"
//                                         value="designation"
//                                         checked={selectedOption === "designation"}
//                                         onChange={() => setSelectedOption("designation")}
//                                     /> Designation
//                                 </label>
//                                 <label>
//                                     <input
//                                         type="radio"
//                                         value="branch"
//                                         checked={selectedOption === "branch"}
//                                         onChange={() => setSelectedOption("branch")}
//                                     /> Branch
//                                 </label>
//                             </div> */}
//                         </div>
//                         <Select
//                             options={users}
//                             isMulti
//                             value={assignedTo}
//                             onChange={setAssignedTo} // Updates state
//                             className="w-full "
//                         />
//                     </div>

//                     {/* Submit Button */}
//                     <div className="mt-10 mx-20">
//                         <button
//                             type="submit"
//                             className="border border-black p-2 px-6 rounded-lg bg-[#016E5B] hover:[#017E5B] text-white"
//                         >
//                             Assign Training
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default Mandatorytrainingdata

// src/pages/Create/Mandatorytrainingdata.jsx
import { useEffect, useState } from "react";
import Select from "react-select";
import baseUrl from "../../../api/api";
import Header from "../../../components/Header/Header";
import { toast } from "react-toastify";
import SideNav from "../../../components/SideNav/SideNav";

const isObjectId = (v) => /^[0-9a-fA-F]{24}$/.test(String(v || ""));

const Mandatorytrainingdata = () => {
  const [modules, setModules] = useState([]);                 // select options
  const [roleOptions, setRoleOptions] = useState([]);         // select options
  const [trainingName, setTrainingName] = useState("");
  const [assignedTo, setAssignedTo] = useState([]);           // selected designations
  const [selectedModules, setSelectedModules] = useState([]); // selected modules
  const [days, setDays] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await fetch(`${baseUrl.baseUrl}api/modules`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
        });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json();

        const opts = (Array.isArray(data) ? data : [])
          .map((m) => {
            const id = m?._id ?? m?.id ?? m?.moduleId;
            if (!isObjectId(id)) return null;
            return { value: String(id), label: m?.moduleName || m?.name || "Unnamed Module" };
          })
          .filter(Boolean);

        setModules(opts);
      } catch (err) {
        console.error("Modules fetch failed:", err);
        toast.error("Failed to load modules.");
      }
    };

    const fetchRoleOptions = async () => {
      try {
        const res = await fetch(`${baseUrl.baseUrl}api/employee_range`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ startEmpId: "EMP1", endEmpId: "EMP9999" }),
      });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const json = await res.json();

        const uniqueRoles = Array.from(
          new Map(
            (json?.data || [])
              .map((e) => (e?.role_name ?? "").trim())
              .filter(Boolean)
              .map((r) => [r.toLowerCase(), r])
          ).values()
        ).sort((a, b) => a.localeCompare(b));

        setRoleOptions(uniqueRoles.map((r) => ({ value: r, label: r })));
      } catch (err) {
        console.error("Employee roles fetch failed:", err);
        toast.error("Failed to load designations.");
      }
    };

    fetchModules();
    fetchRoleOptions();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const moduleIds = (selectedModules || [])
      .map((o) => String(o?.value ?? "").trim())
      .filter((id) => isObjectId(id));

    const designations = (assignedTo || [])
      .map((o) => String(o?.value ?? "").trim())
      .filter(Boolean);

    const dayCount = Number(days);

    if (!trainingName.trim()) return toast.error("Enter a training name.");
    if (!Number.isFinite(dayCount) || dayCount <= 0) return toast.error("Days must be a positive number.");
    if (moduleIds.length === 0) return toast.error("Select at least one module (valid ID).");
    if (designations.length === 0) return toast.error("Select at least one designation.");

    const payload = {
      trainingName: trainingName.trim(),
      modules: moduleIds,
      days: dayCount,
      // backend expects designations in this key (legacy name):
      workingBranch: designations,
    };

    try {
      const res = await fetch(`${baseUrl.baseUrl}api/mandatorytrainings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text || "{}"); } catch { data = { message: text }; }

      if (!res.ok) {
        throw new Error(data?.error || data?.message || `HTTP ${res.status} ${res.statusText}`);
      }

      toast.success(data?.message || "Training created!");
      setTrainingName("");
      setDays("");
      setSelectedModules([]);
      setAssignedTo([]);
    } catch (err) {
      console.error("Submit failed:", err);
      // This shows the server's actual message (e.g., invalid id / no users found)
      toast.error(String(err?.message || "Server Error"));
    }
  };

  return (
    <div>
      <div className="w-full h-full bg-white">
        <Header name="Mandatory training" />
      </div>
      <SideNav />

      <div className="md:ml-[100px] mt-[150px]">
        <form onSubmit={handleSubmit} className="text-black w-[800px] mt-10">
          {/* Training Name */}
          <div className="flex flex-col gap-5 mx-20 mt-5">
            <div className="flex flex-col gap-2">
              <p>Training Name</p>
              <input
                type="text"
                placeholder="Training title"
                className="bg-white border p-1 w-full rounded-lg border-black"
                value={trainingName}
                onChange={(e) => setTrainingName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Days */}
          <div className="flex flex-col gap-5 mx-20 mt-5">
            <div className="flex flex-col gap-2">
              <p>Days</p>
              <input
                type="number"
                placeholder="Number of days"
                className="bg-white w-full border p-1 rounded-lg border-black"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                required
                min={1}
              />
            </div>
          </div>

          {/* Modules */}
          <div className="flex flex-col gap-2 mx-20 mt-5">
            <p>Modules</p>
            <Select
              options={modules}
              isMulti
              value={selectedModules}
              onChange={(opts) => setSelectedModules((opts || []).filter((o) => isObjectId(o?.value)))}
              className="w-full"
              placeholder="Select module(s)…"
            />
          </div>

          {/* Assign To Designation */}
          <div className="flex flex-col gap-2 mx-20 mt-5">
            <p>Assign To Designation</p>
            <Select
              options={roleOptions}
              isMulti
              value={assignedTo}
              onChange={(opts) => setAssignedTo((opts || []).filter((o) => String(o?.value ?? "").trim()))}
              className="w-full"
              placeholder="Select designation(s)…"
            />
          </div>

          <div className="mt-10 mx-20">
            <button
              type="submit"
              className="border border-black p-2 px-6 rounded-lg bg-[#016E5B] hover:bg-[#017E5B] text-white"
            >
              Assign Training
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Mandatorytrainingdata;
