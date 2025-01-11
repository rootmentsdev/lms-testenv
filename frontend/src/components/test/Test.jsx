import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts";

const Test = () => {
    const [change, setChange] = useState(false); // Toggle between Assessment and Training

    const staticData = [
        {
            name: "Branch 1",
            CompletedAssessment: 80,
            PendingAssessment: 20,
            CompletedTraining: 70,
            PendingTraining: 30,
        },
        {
            name: "Branch 2",
            CompletedAssessment: 60,
            PendingAssessment: 40,
            CompletedTraining: 50,
            PendingTraining: 50,
        },
    ];

    return (
        <div>
            <div className="md:ml-[150px] ml-10 w-[600px] h-[360px]">
                <div className="w-full h-full border border-gray-300 rounded-xl shadow-lg">
                    <div className="flex justify-end mt-3 mx-3 text-[#2E7D32]">
                        <div className="flex gap-2">
                            <label>Assessment</label>
                            <input
                                type="checkbox"
                                className="toggle"
                                onClick={() => setChange((prev) => !prev)}
                                defaultChecked
                            />
                            <label>Training</label>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={staticData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {change ? (
                                <>
                                    <Bar dataKey="CompletedAssessment" stackId="a" fill="#4CAF50" />
                                    <Bar dataKey="PendingAssessment" stackId="a" fill="#E0E0E0" />
                                </>
                            ) : (
                                <>
                                    <Bar dataKey="CompletedTraining" stackId="a" fill="#4CAF50" />
                                    <Bar dataKey="PendingTraining" stackId="a" fill="#E0E0E0" />
                                </>
                            )}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Test;
