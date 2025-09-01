import { useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import baseUrl from "../../api/api";

const HomeBar = () => {
    const [change, setChange] = useState(false); // Toggle between Assessment and Training
    const [allData, setAllData] = useState([]); // Data from API
    const token = localStorage.getItem('token');
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {

                const response = await fetch(`${baseUrl.baseUrl}api/admin/get/HomeProgressData`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${token}`,
                    },
                    credentials: "include",
                });
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
                const result = await response.json();
                setAllData(result.data);
                setLoading(true)
            } catch (error) {
                setLoading(true)
                console.error("Failed to fetch data:", error.message);
            }
        };

        fetchData();
    }, [token]);

    // Process data for recharts
    const chartData = allData.map((obj) => {
        // The backend now sends the correct percentages, so we don't need to recalculate
        const completedTraining = obj.completeTraining || 0;
        const pendingTraining = obj.pendingTraining || 0;
        const completedAssessment = obj.completeAssessment || 0;
        const pendingAssessment = obj.pendingAssessment || 0;

        return {
            name: obj.locCode,
            Completed: change ? completedAssessment : completedTraining,
            Pending: change ? pendingAssessment : pendingTraining,
            customTooltipText: change
                ? `Branch: ${obj.branchName}\nCompleted: ${completedAssessment.toFixed(2)}%\nPending: ${pendingAssessment.toFixed(2)}%`
                : `Branch: ${obj.branchName}\nCompleted: ${completedTraining.toFixed(2)}%\nPending: ${pendingTraining.toFixed(2)}%`,
        };
    });

    // Tooltip Formatter
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const { customTooltipText } = payload[0].payload;
            return (
                <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <p className="text-sm text-gray-700 whitespace-pre-line">{customTooltipText}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <>

            {
                loading ? <div>
                    <div className="md:ml-[150px] ml-10 w-[600px] h-[400px]"> {/* Increased height */}
                        <div className="w-full h-full border border-gray-300 rounded-xl shadow-lg "> {/* Added padding */}
                            <div className="flex justify-end mt-3 mx-3 text-[#2E7D32]">
                                <div className="flex gap-2 items-center">
                                    <label>Assessment</label>
                                    <input
                                        type="checkbox"
                                        className="toggle border-blue-500 bg-[#016E5B] [--tglbg:white] hover:bg-[#287468]"
                                        onClick={() => setChange((prev) => !prev)}
                                        defaultChecked
                                    />
                                    <label>Training</label>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height="95%"> {/* Adjusted height */}
                                <BarChart
                                    data={chartData}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 30 }} // Increased bottom margin
                                    barSize={allData?.length < 10 ? 40 : 20}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis tickFormatter={(value) => `${value}%`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend layout="horizontal" verticalAlign="bottom" align="center" /> {/* Ensures legend stays inside */}
                                    <Bar dataKey="Completed" stackId="a" fill="#016E5B" />
                                    <Bar dataKey="Pending" stackId="a" fill="#E0E0E0" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div> : <div>

                    <div role="status" className="flex items-center justify-center md:ml-[150px] ml-10 w-[600px] h-[400px] shadow-xl bg-slate-100 rounded-lg animate-pulse d">

                        <span className="sr-only">Loading...</span>
                    </div>
                </div >
            }
        </>

    );
};

export default HomeBar;
