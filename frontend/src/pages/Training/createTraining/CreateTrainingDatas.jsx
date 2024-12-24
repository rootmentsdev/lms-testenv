import { useEffect, useState } from "react";
import Header from "../../../components/Header/Header";
import baseUrl from "../../../api/api";

const CreateTrainingDatas = () => {
    const [modules, setModules] = useState([]);
    const [users, setUsers] = useState([]); // Ensure users is initialized as an array
    const [trainingName, setTrainingName] = useState("");
    const [assignedTo, setAssignedTo] = useState("");
    const [selectedModules, setSelectedModules] = useState([]);
    const [days, setDays] = useState("");
    const [isDropdownOpen, setDropdownOpen] = useState(false);

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
                setModules(data);
            } catch (error) {
                console.error("Failed to fetch modules:", error.message);
            }
        };

        const fetchUser = async () => {
            try {
                const response = await fetch(`${baseUrl.baseUrl}api/usercreate/getBranch`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                const data = await response.json();

                // Ensure the data is an array before setting the state
                if (Array.isArray(data.data)) {
                    setUsers(data.data);
                } else {
                    console.error("Users data is not an array:", data);
                }
            } catch (error) {
                console.error("Failed to fetch users:", error.message);
            }
        };

        fetchModules();
        fetchUser();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        alert(assignedTo)
        const trainingData = {
            trainingName,

            workingBranch: assignedTo,
            modules: selectedModules,
            days,
        };

        try {
            const response = await fetch(`${baseUrl.baseUrl}api/trainings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(trainingData),
            });

            if (response.ok) {
                alert("Training created successfully!");
                setTrainingName("");
                setAssignedTo("admin");
                setSelectedModules([]);
                setDays("");
            } else {
                const error = await response.json();
                alert(error.message || "Failed to create training.");
            }
        } catch (error) {
            console.error("Failed to submit training:", error.message);
            alert("Error submitting training.");
        }
    };

    const handleModuleToggle = (moduleName) => {
        setSelectedModules((prevModules) =>
            prevModules.includes(moduleName)
                ? prevModules.filter((module) => module !== moduleName)
                : [...prevModules, moduleName]
        );
    };

    return (
        <div>
            <div className="w-full h-full bg-white">
                <Header name="Assign new Training" />
            </div>
            <div>
                <form onSubmit={handleSubmit} className="text-black w-[800px] mt-10">
                    <div className="flex justify-between  mx-20">
                        <div>
                            <div className="flex flex-col gap-5">
                                <p>Training Name</p>
                                <input
                                    type="text"
                                    placeholder="Training title"
                                    className="bg-white border p-1 w-60 rounded-lg border-black"
                                    value={trainingName}
                                    onChange={(e) => setTrainingName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-5 mt-5">
                                <p>Modules</p>
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => setDropdownOpen(!isDropdownOpen)}
                                        className="w-full bg-white border border-black p-2 text-left rounded-lg"
                                    >
                                        {selectedModules.length
                                            ? `${selectedModules.length} Modules Selected`
                                            : "Select Modules"}
                                    </button>
                                    {isDropdownOpen && (
                                        <div
                                            className="absolute border bg-white p-2 w-auto  mt-2 shadow-lg rounded-lg"
                                            style={{ zIndex: 1000 }}
                                        >
                                            {modules.map((item) => (
                                                <div key={item?._id} className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id={item?._id}
                                                        value={item?.moduleName}
                                                        checked={selectedModules.includes(item?._id)}
                                                        onChange={() => handleModuleToggle(item?._id)}
                                                        className="mr-2"
                                                    />
                                                    <label htmlFor={item?._id}>{item?.moduleName}</label>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-5 flex-col">
                            <div className="flex flex-col gap-5">
                                <p>Assign To</p>
                                <select
                                    className="bg-white w-60 border p-1 border-black"
                                    value={assignedTo}
                                    onChange={(e) => setAssignedTo(e.target.value)}
                                    required
                                >
                                    {Array.isArray(users) && users.map((item) => (
                                        <option key={item?._id} value={item?.locCode}>{item?.workingBranch}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-5">
                                <p>Days</p>
                                <input
                                    type="text"
                                    placeholder="Number of days"
                                    className="bg-white w-60 border p-1 rounded-lg border-black"
                                    value={days}
                                    onChange={(e) => setDays(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="border border-black p-2 flex justify-self-end px-6 rounded-lg bg-green-500 hover:bg-green-600 text-white"
                    >
                        Assign Training
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateTrainingDatas;
