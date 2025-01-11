import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { useEffect, useState, useRef } from "react";
import baseUrl from "../../api/api";

// Register chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const HomeBar = () => {
    const [change, setChange] = useState(false); // Toggle between Assessment and Training
    const [AllData, setAllData] = useState([]); // Data from API
    const canvasRef = useRef(null); // Reference to the canvas element

    // Function to apply gradients
    const canvasCallback = (canvas) => {
        if (canvas) {
            const ctx = canvas.getContext("2d");
            console.log("Canvas dimensions:", canvas.width, canvas.height); // Debugging canvas dimensions

            if (ctx) {
                // Create gradient for Completed bars
                const completedGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                completedGradient.addColorStop(0, "#00A387"); // Start color (lighter green)
                completedGradient.addColorStop(1, "#016E5B"); // End color (darker green)

                // Create gradient for Pending bars
                const pendingGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                pendingGradient.addColorStop(0, "#EBEBEB"); // Start color (light grey)
                pendingGradient.addColorStop(1, "#a6a6a6"); // End color (dark grey)

                // Apply gradients to datasets
                data1.datasets[0].backgroundColor = completedGradient || "#00A387"; // Fallback to solid color
                data1.datasets[1].backgroundColor = pendingGradient || "#EBEBEB";
                data2.datasets[0].backgroundColor = completedGradient || "#00A387";
                data2.datasets[1].backgroundColor = pendingGradient || "#EBEBEB";
            }
        }
    };

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${baseUrl.baseUrl}api/admin/get/HomeProgressData`);
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
                const result = await response.json();
                setAllData(result.data); // Update state with fetched data
            } catch (error) {
                console.error("Failed to fetch data:", error.message);
            }
        };

        fetchData();
    }, []);

    // Reapply gradient when data or toggle changes
    useEffect(() => {
        if (canvasRef.current) {
            canvasCallback(canvasRef.current);
        }
    }, [change, AllData]); // Trigger when data or toggle state changes

    // Map data for the chart
    const names = AllData?.map((obj) => obj.locCode);
    const Assessment = AllData?.map((obj) => obj.completeAssessment);
    const PendingAssessment = AllData?.map((obj) => obj.pendingAssessment);
    const Training = AllData?.map((obj) => obj.completeTraining);
    const PendingTraining = AllData?.map((obj) => obj.pendingTraining);
    const LabelAssessment = AllData?.map(
        (obj) =>
            `${obj.branchName}\nCompleted: ${Math.round(obj.completeAssessment)}% and Pending: ${Math.round(
                obj.pendingAssessment
            )}%`
    );
    const LabelTraining = AllData?.map(
        (obj) =>
            `${obj.branchName}\nCompleted: ${Math.round(obj.completeTraining)}% and Pending: ${Math.round(
                obj.pendingTraining
            )}%`
    );

    // Data for Assessment and Training charts
    const data1 = {
        labels: names,
        datasets: [
            {
                label: "Completed",
                data: Assessment,
                borderWidth: 1,
                borderRadius: 0,
                customTooltipText: LabelAssessment,
            },
            {
                label: "Pending",
                data: PendingAssessment,
                borderWidth: 0,
                borderRadius: 8,
                customTooltipText: LabelAssessment,
            },
        ],
    };

    const data2 = {
        labels: names,
        datasets: [
            {
                label: "Completed",
                data: Training,
                borderWidth: 1,
                borderRadius: 0,
                customTooltipText: LabelTraining,
            },
            {
                label: "Pending",
                data: PendingTraining,
                borderWidth: 0,
                borderRadius: 8,
                customTooltipText: LabelTraining,
            },
        ],
    };

    // Chart options
    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: true,
                callbacks: {
                    title: (tooltipItems) => tooltipItems[0].label,
                    label: (tooltipItem) => {
                        const dataset = tooltipItem.dataset;
                        const index = tooltipItem.dataIndex;
                        return dataset.customTooltipText[index];
                    },
                },
            },
        },
        scales: {
            x: {
                stacked: true,
                grid: {
                    display: false,
                },
            },
            y: {
                stacked: true,
                ticks: {
                    callback: (value) => `${value}%`, // Add percentage sign
                },
                grid: {
                    color: "rgba(0, 0, 0, 0.1)", // Grid line color
                },
            },
        },
    };

    return (
        <div>
            <div className="md:ml-[150px] ml-10 w-[600px] h-[360px]">
                <div className="w-full h-full border border-gray-300 rounded-xl shadow-lg">
                    <div className="flex justify-end mt-3 mx-3 text-[#016E5B]">
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
                    <Bar
                        key={change} // Force re-render on toggle
                        className="w-full h-full"
                        data={change ? data1 : data2}
                        options={options}
                        ref={(ref) => {
                            if (ref) {
                                canvasRef.current = ref.canvas;
                                canvasCallback(ref.canvas);
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default HomeBar;
