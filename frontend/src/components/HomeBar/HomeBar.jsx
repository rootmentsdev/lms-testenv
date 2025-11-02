import { useState } from "react";
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
import { useGetHomeProgressQuery } from "../../features/dashboard/dashboardApi";

const HomeBar = () => {
    const [change, setChange] = useState(false); // Toggle between Assessment and Training
    
    // Use RTK Query for automatic caching and loading
    const { data: responseData, isLoading: loading } = useGetHomeProgressQuery();
    const allData = responseData?.data || [];

    // Process data for recharts
    const chartData = allData.map((obj) => {
        const totalTraining = obj.completeTraining + obj.pendingTraining;
        const totalAssessment = obj.completeAssessment + obj.pendingAssessment;

        // Calculate percentages for Training (using total for Training only)
        const completedTraining = totalTraining ? (obj.completeTraining / totalTraining) * 100 : 0;
        const pendingTraining = totalTraining ? (obj.pendingTraining / totalTraining) * 100 : 0;

        // Calculate percentages for Assessment (using total for Assessment only)
        const completedAssessment = totalAssessment ? (obj.completeAssessment / totalAssessment) * 100 : 0;
        const pendingAssessment = totalAssessment ? (obj.pendingAssessment / totalAssessment) * 100 : 0;

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
    
    // Handle empty data
    if (!loading && chartData.length === 0) {
        return (
            <div>
                <div className="md:ml-[150px] ml-10 w-[600px] h-[400px]">
                    <div className="w-full h-full border border-gray-300 rounded-xl shadow-lg flex items-center justify-center">
                        <p className="text-gray-500">No data available for chart</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {loading ? (
                <div>
                    <div role="status" className="flex items-center justify-center md:ml-[150px] ml-10 w-[600px] h-[400px] shadow-xl bg-slate-100 rounded-lg animate-pulse d">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            ) : (
                <div>
                    <div className="md:ml-[150px] ml-10 w-[600px] h-[400px]">
                        <div className="w-full h-full border border-gray-300 rounded-xl shadow-lg">
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
                            <ResponsiveContainer width="100%" height="95%">
                                <BarChart
                                    data={chartData}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                                    barSize={allData?.length < 10 ? 40 : 20}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis tickFormatter={(value) => `${value}%`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                                    <Bar dataKey="Completed" stackId="a" fill="#016E5B" />
                                    <Bar dataKey="Pending" stackId="a" fill="#E0E0E0" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default HomeBar;
