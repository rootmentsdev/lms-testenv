
import { useEffect, useState } from "react";
import Select from "react-select"; // Import react-select
import baseUrl from "../../../api/api";
import Header from "../../../components/Header/Header";
import { toast } from "react-toastify";
import SideNav from "../../../components/SideNav/SideNav";

const Mandatorytrainingdata = () => {
    const [modules, setModules] = useState([]); // Module options
    const [users, setUsers] = useState([]);     // Users options
    const [trainingName, setTrainingName] = useState("");
    const [assignedTo, setAssignedTo] = useState([]); // Multi-select values
    const [selectedModules, setSelectedModules] = useState([]); // Multi-select values
    const [days, setDays] = useState("");

    // Fetch Modules
    useEffect(() => {
        const fetchModules = async () => {
            try {
                const response = await fetch(`${baseUrl.baseUrl}api/modules`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                const data = await response.json();
                console.log(data);

                // Map modules to options required by react-select
                const options = data.map((module) => ({
                    value: module.moduleId,
                    label: module.moduleName,
                }));

                setModules(options);
            } catch (error) {
                console.error("Failed to fetch modules:", error.message);
            }
        };

        const fetchUsers = async () => {
            try {
                const endpoint = "api/usercreate/getAll/designation";
                const response = await fetch(`${baseUrl.baseUrl}${endpoint}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                const data = await response.json();
                console.log(data);

                // Map users to options required by react-select


                const options = data.data.map((user) => ({
                    value: user.designation,
                    label: user.designation,
                }));
                setUsers(options);

            } catch (error) {
                console.error("Failed to fetch users:", error.message);
            }
        };

        fetchModules();
        fetchUsers();
    }, []);

    // Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        const trainingData = {
            trainingName,
            workingBranch: assignedTo.map((item) => item.value), // Extract values
            modules: selectedModules.map((item) => item.value), // Extract values
            days,

        };
        try {
            console.log(trainingData); // Log final data for submission
            toast("Form Submitted Successfully!");
            // POST request (uncomment to use)
            const response = await fetch(`${baseUrl.baseUrl}api/mandatorytrainings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(trainingData),
            });
            const data = await response.json();
            toast.success(data.message);
        } catch (error) {
            console.error("Failed to submit training:", error.message);
            toast.error("Error submitting training.");
        }
    };

    return (
        <div>
            <div className="w-full h-full bg-white">
                <Header name="Mandatory training" />
            </div>
            <SideNav />
            <div className="md:ml-[100px] mt-[100px]">
                <form onSubmit={handleSubmit} className="text-black w-[800px] mt-10">
                    {/* Training Name */}
                    <div className="flex flex-col gap-5 mx-20 mt-5">
                        <div className="flex flex-col gap-5">
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
                        <div className="flex flex-col gap-5">
                            <p>Days</p>
                            <input
                                type="number"
                                placeholder="Number of days"
                                className="bg-white w-full border p-1 rounded-lg border-black"
                                value={days}
                                onChange={(e) => setDays(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Modules Dropdown */}
                    <div className="flex flex-col gap-5 mx-20 mt-5">
                        <p>Modules</p>
                        <Select
                            options={modules}
                            isMulti
                            value={selectedModules}
                            onChange={setSelectedModules} // Updates state
                            className="w-full"
                        />
                    </div>

                    {/* Assign To Dropdown */}
                    <div className="flex flex-col gap-1 mx-20 mt-5">
                        <p>Assign To Designation</p>
                        <div className="flex flex-col gap-5 mx-20 mt-5">
                            {/* <div className="flex gap-5">
                                <label>
                                    <input
                                        type="radio"
                                        value="user"
                                        checked={selectedOption === "user"}
                                        onChange={() => setSelectedOption("user")}
                                    /> User
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        value="designation"
                                        checked={selectedOption === "designation"}
                                        onChange={() => setSelectedOption("designation")}
                                    /> Designation
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        value="branch"
                                        checked={selectedOption === "branch"}
                                        onChange={() => setSelectedOption("branch")}
                                    /> Branch
                                </label>
                            </div> */}
                        </div>
                        <Select
                            options={users}
                            isMulti
                            value={assignedTo}
                            onChange={setAssignedTo} // Updates state
                            className="w-full "
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="mt-10 mx-20">
                        <button
                            type="submit"
                            className="border border-black p-2 px-6 rounded-lg bg-[#016E5B] hover:[#017E5B] text-white"
                        >
                            Assign Training
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Mandatorytrainingdata