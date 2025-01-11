import { useEffect, useState } from "react";
import baseUrl from "../../api/api";


const TopEmployeeAndBranch = () => {
    const [AllData, setAllData] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${baseUrl.baseUrl}api/admin/get/bestThreeUser`);
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
    return (
        <div className="p-2 bg-white shadow-md rounded-md w-full h-full mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Top Performance</h2>

            </div>
            <div className="mb-4">
                <button className="bg-green-600 text-white px-4 py-1 rounded-md text-sm">Employees</button>
            </div>
            <div className="space-y-4">

                <div className="flex items-center bg-gray-100 p-2 rounded-md">
                    <div className="flex items-center justify-center w-12 h-12 bg-yellow-400 text-white font-bold text-lg rounded-full">
                        01
                    </div>
                    <div className="ml-4 flex-1">
                        <p className="font-medium">{AllData[0]?.username}</p>
                        <p className="text-gray-500 text-sm">{AllData[0]?.branch}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-green-600">{Math.round(AllData[0]?.trainingProgress)}% <span className="text-gray-500">Training Completed</span></p>
                        <p className="font-bold text-green-600">{Math.round(AllData[0]?.assessmentProgress)}% <span className="text-gray-500">Assessment Score</span></p>
                    </div>
                </div>

                <div className="flex items-center bg-gray-100 p-2 rounded-md">
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-400 text-white font-bold text-lg rounded-full">
                        02
                    </div>
                    <div className="ml-4 flex-1">
                        <p className="font-medium">{AllData[1]?.username}</p>
                        <p className="text-gray-500 text-sm">{AllData[1]?.branch}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-green-600">{Math.round(AllData[1]?.trainingProgress)}% <span className="text-gray-500">Training Completed</span></p>
                        <p className="font-bold text-green-600"> {Math.round(AllData[1]?.assessmentProgress)}%<span className="text-gray-500">Assessment Score</span></p>
                    </div>
                </div>

                <div className="flex items-center bg-gray-100 p-2 rounded-md">
                    <div className="flex items-center justify-center w-12 h-12 bg-yellow-700 text-white font-bold text-lg rounded-full">
                        03
                    </div>
                    <div className="ml-4 flex-1">
                        <p className="font-medium">{AllData[2]?.username}</p>
                        <p className="text-gray-500 text-sm">{AllData[2]?.branch}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-green-600">{Math.round(AllData[2]?.trainingProgress)}%  <span className="text-gray-500">Training Completed</span></p>
                        <p className="font-bold text-green-600">{Math.round(AllData[2]?.assessmentProgress)}% <span className="text-gray-500">Assessment Score</span></p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TopEmployeeAndBranch