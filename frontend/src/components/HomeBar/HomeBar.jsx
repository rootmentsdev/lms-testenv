import { Bar } from "react-chartjs-2"; // Removed Recharts import
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { useState } from "react";

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

    const [change, setChange] = useState(false)



    const canvasCallback = (canvas) => {
        const ctx = canvas.getContext("2d");

        // Gradient for Completed
        const completedGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        completedGradient.addColorStop(0, "#00A387"); // Start color (lighter green)
        completedGradient.addColorStop(1, "#016E5B"); // End color (darker green)

        // Gradient for Pending
        const pendingGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        pendingGradient.addColorStop(0, "#EBEBEB"); // Start color (light grey)
        pendingGradient.addColorStop(1, "#a6a6a6"); // End color (dark grey)

        data1.datasets[0].backgroundColor = completedGradient;
        data1.datasets[1].backgroundColor = pendingGradient;

        data2.datasets[0].backgroundColor = completedGradient;
        data2.datasets[1].backgroundColor = pendingGradient;
    };

    const data1 = {
        labels: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14"],
        datasets: [
            {
                label: "Completed",
                data: [62, 80, 76, 45, 54, 70, 63, 50, 80, 34, 84, 62, 48, 57],
                borderWidth: 1,
                borderRadius: 0,
                customTooltipText: [
                    "Completed on time", "Exceeds expectations", "Great progress",
                    "Needs improvement", "Average performance", "Good teamwork",
                    "Excellent", "On schedule", "Exemplary", "Falling behind",
                    "Top performer", "Satisfactory", "Needs attention", "Steady progress"
                ],
            },
            {
                label: "Pending",
                data: [38, 20, 24, 55, 46, 30, 37, 50, 20, 66, 16, 38, 52, 43], // Example data
                borderWidth: 0,
                borderRadius: 8,
                customTooltipText: [
                    "Pending work", "Delayed tasks", "Awaiting approval",
                    "In review", "Pending feedback", "Delayed by team",
                    "Awaiting next steps", "On hold", "Waiting for resources",
                    "Missed deadlines", "Pending high-priority tasks",
                    "Needs manager review", "On pause", "Rescheduled"
                ],
            },
        ],
    };
    const data2 = {
        labels: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14"],
        datasets: [
            {
                label: "Completed",
                data: [38, 20, 24, 55, 46, 30, 37, 50, 20, 66, 16, 38, 52, 43], // Example data

                borderWidth: 1,
                borderRadius: 0,
                customTooltipText: [
                    "Pending work", "Delayed tasks", "Awaiting approval",
                    "In review", "Pending feedback", "Delayed by team",
                    "Awaiting next steps", "On hold", "Waiting for resources",
                    "Missed deadlines", "Pending high-priority tasks",
                    "Needs manager review", "On pause", "Rescheduled"
                ],
            },
            {
                label: "Pending",
                data: [62, 80, 76, 45, 54, 70, 63, 50, 80, 34, 84, 62, 48, 57],

                borderWidth: 0,
                borderRadius: 8,
                customTooltipText: [
                    "Completed on time", "Exceeds expectations", "Great progress",
                    "Needs improvement", "Average performance", "Good teamwork",
                    "Excellent", "On schedule", "Exemplary", "Falling behind",
                    "Top performer", "Satisfactory", "Needs attention", "Steady progress"
                ],
            },
        ],
    };
    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false, // Hide legend
            },
            tooltip: {
                enabled: true, // Enable tooltips
                callbacks: {
                    title: (tooltipItems) => {
                        return tooltipItems[0].label; // Show the label of the bar (e.g., Branch 1, Branch 2)
                    },
                    label: (tooltipItem) => {
                        // Display unique text for each bar
                        const dataset = tooltipItem.dataset;
                        const index = tooltipItem.dataIndex;
                        return dataset.customTooltipText[index]; // Get the unique text
                    },
                },
            },
            datalabels: {
                display: true,
                align: "end",
                anchor: "end",
                borderRadius: 10,
                formatter: (value) => `${value}%`, // Display value with percentage
                font: {
                    size: 12,
                    weight: "bold",
                },
                color: "#000",
            },
        },
        scales: {
            x: {
                stacked: true,
                grid: {
                    display: false, // Hide x-axis grid lines
                },
            },
            y: {
                stacked: true,
                ticks: {
                    callback: (value) => `${value}%`, // Add percentage sign
                    stepSize: 20, // Step size for y-axis
                },
                grid: {
                    color: "rgba(0, 0, 0, 0.1)", // y-axis grid line color
                },
            },
        },
        layout: {
            padding: {
                top: 30, // Add padding above chart
                right: 10, // Add padding on the right
                left: 0, // No padding on the left
                bottom: 0, // No padding at the bottom
            },
        },
    };

    return (
        <div>
            <div className="md:ml-[150px] ml-10 w-[600px] h-[360px]">


                <div className="w-full h-full border border-gray-300 rounded-xl shadow-lg">
                    <div className="flex justify-end mt-3 mx-3 text-[#016E5B]" >
                        <div className="flex gap-2">
                            <label >Assessment</label>
                            <input type="checkbox" className="toggle" onClick={() => setChange((prev) => !prev)} defaultChecked />
                            <label >Traning</label>
                        </div>
                    </div>
                    <Bar className="w-full h-full" data={change ? data1 : data2} options={options} ref={(ref) => {
                        if (ref) {
                            canvasCallback(ref.canvas);
                        }
                    }} />



                </div>
            </div>

        </div >
    )
}

export default HomeBar