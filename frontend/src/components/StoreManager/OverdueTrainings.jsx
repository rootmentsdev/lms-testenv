import { useEffect, useState } from "react";
import baseUrl from "../../api/api";

const OverdueTrainings = () => {
    const token = localStorage.getItem("token");
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    `${baseUrl.baseUrl}api/admin/get/storemanagerduedata`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        credentials: "include",
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch overdue training data");
                }

                const result = await response.json();
                setData(result.topOverdueUsers);
                console.log(result.topOverdueUsers);

            } catch (error) {
                console.error("Error fetching overdue training data:", error);
            }
        };

        fetchData();
    }, [token]);

    return (
        <div className="w-[600px] border bg-white shadow-md rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Overdue Trainings
            </h3>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-gray-600 text-sm border-b">
                        <th className="py-2">Employee Name</th>
                        <th className="py-2">Trainings</th>
                        <th className="py-2">Assessments</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((user, index) => (
                        <tr key={index} className="text-sm text-gray-800 border-b">
                            <td className="py-2">{user.name}</td>
                            <td className="py-2 text-red-500 font-semibold">
                                {String(user.overdueTrainings.length).padStart(2, "0")}
                            </td>
                            <td className="py-2 text-red-500 font-semibold">
                                {String(user.overdueAssessments.length).padStart(2, "0")}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OverdueTrainings;
