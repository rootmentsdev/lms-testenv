// import { Bar } from "react-chartjs-2";
// import {
//     Chart as ChartJS,
//     CategoryScale,
//     LinearScale,
//     BarElement,
//     Title,
//     Tooltip,
//     Legend,
// } from "chart.js";
// import { useEffect, useState, useRef } from "react";
// import baseUrl from "../../api/api";

// ChartJS.register(
//     CategoryScale,
//     LinearScale,
//     BarElement,
//     Title,
//     Tooltip,
//     Legend
// );

// const HomeBar = () => {
//     const [change, setChange] = useState(false); // Toggle between Assessment and Training
//     const [AllData, setAllData] = useState([]); // Data from API
//     const canvasRef = useRef(null); // Reference to the canvas element

//     const canvasCallback = (canvas) => {
//         if (canvas) {
//             const ctx = canvas.getContext("2d");

//             if (ctx) {
//                 // Standardized colors for gradients
//                 const completedGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
//                 completedGradient.addColorStop(0, "#4CAF50"); // Light green
//                 completedGradient.addColorStop(1, "#2E7D32"); // Dark green

//                 const pendingGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
//                 pendingGradient.addColorStop(0, "#E0E0E0"); // Light grey
//                 pendingGradient.addColorStop(1, "#757575"); // Dark grey

//                 // Apply gradients to datasets
//                 data1.datasets[0].backgroundColor = completedGradient || "#4CAF50";
//                 data1.datasets[1].backgroundColor = pendingGradient || "#E0E0E0";
//                 data2.datasets[0].backgroundColor = completedGradient || "#4CAF50";
//                 data2.datasets[1].backgroundColor = pendingGradient || "#E0E0E0";
//             }
//         }
//     };

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const response = await fetch(`${baseUrl.baseUrl}api/admin/get/HomeProgressData`);
//                 if (!response.ok) {
//                     throw new Error(`Error: ${response.status} ${response.statusText}`);
//                 }
//                 const result = await response.json();
//                 setAllData(result.data);
//             } catch (error) {
//                 console.error("Failed to fetch data:", error.message);
//             }
//         };

//         fetchData();
//     }, []);

//     useEffect(() => {
//         if (canvasRef.current) {
//             canvasCallback(canvasRef.current);
//         }
//     }, [change, AllData]);

//     const names = AllData?.map((obj) => obj.locCode);
//     const Assessment = AllData?.map((obj) => obj.completeAssessment);
//     const PendingAssessment = AllData?.map((obj) => obj.pendingAssessment);
//     const Training = AllData?.map((obj) => obj.completeTraining);
//     const PendingTraining = AllData?.map((obj) => obj.pendingTraining);
//     const LabelAssessment = AllData?.map(
//         (obj) =>
//             `${obj.branchName}\nCompleted: ${Math.round(obj.completeAssessment)}% and Pending: ${Math.round(
//                 obj.pendingAssessment
//             )}%`
//     );
//     const LabelTraining = AllData?.map(
//         (obj) =>
//             `${obj.branchName}\nCompleted: ${Math.round(obj.completeTraining)}% and Pending: ${Math.round(
//                 obj.pendingTraining
//             )}%`
//     );

//     const data1 = {
//         labels: names,
//         datasets: [
//             {
//                 label: "Completed",
//                 data: Assessment,
//                 borderWidth: 1,
//                 customTooltipText: LabelAssessment,
//             },
//             {
//                 label: "Pending",
//                 data: PendingAssessment,
//                 borderWidth: 0,
//                 customTooltipText: LabelAssessment,
//             },
//         ],
//     };

//     const data2 = {
//         labels: names,
//         datasets: [
//             {
//                 label: "Completed",
//                 data: Training,
//                 borderWidth: 1,
//                 customTooltipText: LabelTraining,
//             },
//             {
//                 label: "Pending",
//                 data: PendingTraining,
//                 borderWidth: 0,
//                 customTooltipText: LabelTraining,
//             },
//         ],
//     };

//     const options = {
//         responsive: true,
//         plugins: {
//             legend: {
//                 display: false,
//             },
//             tooltip: {
//                 callbacks: {
//                     title: (tooltipItems) => tooltipItems[0].label,
//                     label: (tooltipItem) => {
//                         const dataset = tooltipItem.dataset;
//                         const index = tooltipItem.dataIndex;
//                         return dataset.customTooltipText[index];
//                     },
//                 },
//             },
//         },
//         scales: {
//             x: {
//                 stacked: true,
//                 grid: {
//                     display: false,
//                 },
//             },
//             y: {
//                 stacked: true,
//                 ticks: {
//                     callback: (value) => `${value}%`,
//                 },
//                 grid: {
//                     color: "rgba(0, 0, 0, 0.1)",
//                 },
//             },
//         },
//     };

//     return (
//         <div>
//             <div className="md:ml-[150px] ml-10 w-[600px] h-[360px]">
//                 <div className="w-full h-full border border-gray-300 rounded-xl shadow-lg">
//                     <div className="flex justify-end mt-3 mx-3 text-[#2E7D32]">
//                         <div className="flex gap-2">
//                             <label>Assessment</label>
//                             <input
//                                 type="checkbox"
//                                 className="toggle"
//                                 onClick={() => setChange((prev) => !prev)}
//                                 defaultChecked
//                             />
//                             <label>Training</label>
//                         </div>
//                     </div>
//                     <Bar
//                         key={change}
//                         className="w-full h-full"
//                         data={change ? data1 : data2}
//                         options={options}
//                         ref={(ref) => {
//                             if (ref) {
//                                 canvasRef.current = ref.canvas;
//                                 canvasCallback(ref.canvas);
//                             }
//                         }}
//                     />
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default HomeBar;
