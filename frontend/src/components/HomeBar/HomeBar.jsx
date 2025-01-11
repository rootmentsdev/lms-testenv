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
import { useEffect, useState } from "react";
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

    const [change, setChange] = useState(false)
    const [AllData, setAllData] = useState([])


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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${baseUrl.baseUrl}api/admin/get/HomeProgressData`);
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
                const result = await response.json();
                setAllData(result.data);
                console.log(result.data);
                console.log(AllData);

            } catch (error) {
                console.error("Failed to fetch data:", error.message);
            }
        };

        fetchData();
    }, []);
    const names = AllData?.map(obj => obj.locCode);
    const Assessment = AllData?.map(obj => obj.completeAssessment)
    const PendingAssessment = AllData?.map(obj => obj.pendingAssessment)
    const Training = AllData?.map(obj => obj.completeTraining)
    const PendingTraining = AllData?.map(obj => obj.pendingTraining)
    const Lable = AllData?.map(obj => obj.branchName + "  \n" + "Completed :" + Math.round(obj.completeTraining) + "%" + " and " + " pending :" + Math.round(obj.pendingTraining) + "%")
    const Lable1 = AllData?.map(obj => obj.branchName + "  \n" + "Completed :" + Math.round(obj.completeAssessment) + "%" + " and " + " pending :" + Math.round(obj.pendingAssessment) + "%")

    console.log(names);

    const data1 = {
        labels: names,
        datasets: [
            {
                label: "Completed",
                data: Assessment,
                borderWidth: 1,
                borderRadius: 0,
                customTooltipText: Lable1,
            },
            {
                label: "Pending",
                data: PendingAssessment, // Example data
                borderWidth: 0,
                borderRadius: 8,
                customTooltipText: Lable1,
            },
        ],
    };
    const data2 = {
        labels: names,
        datasets: [
            {
                label: "Completed",
                data: Training, // Example data

                borderWidth: 1,
                borderRadius: 0,
                customTooltipText: Lable,
            },
            {
                label: "Pending",
                data: PendingTraining,

                borderWidth: 0,
                borderRadius: 8,
                customTooltipText: Lable,
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
                    stepSize: 10, // Step size for y-axis
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