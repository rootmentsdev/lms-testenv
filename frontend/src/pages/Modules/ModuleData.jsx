import { Link } from "react-router-dom";
import Header from "../../components/Header/Header"
import RoundModule from "../../components/RoundBar/RoundModule"
import { FaPlus } from "react-icons/fa";
import { useEffect, useState } from "react";
import baseUrl from "../../api/api";
import SideNav from "../../components/SideNav/SideNav";

const ModuleData = () => {
    const [Data, setData] = useState([]); // State to store fetched data

    useEffect(() => {
        const fetchModules = async () => {
            try {
                const response = await fetch(`${baseUrl.baseUrl}api/modules`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                });

                if (!response.ok) { // Check for HTTP errors
                    throw new Error(`Error: ${response.statusText}`);
                }

                const data = await response.json();
                setData(data); // Update state with fetched data
            } catch (error) {
                console.error("Failed to fetch modules:", error.message);
            }
        };

        fetchModules(); // Invoke the function

    }, []);

    useEffect(() => {
        console.log(Data);
    }, [Data]);
    return (
        <div className="w-full h-full bg-white">
            <div><Header name='Modules' /></div>
            <SideNav />
            <div className="md:ml-[200px]  mt-[150px] mx-auto max-w-[1400px] w-full mb-[70px]">
                <div>


                    <div className="flex mx-10 justify-between mt-10 ">
                        <Link to={'/createModule'}>
                            <div className="flex w-56 border-2 justify-evenly items-center py-2 ml-10 cursor-pointer
                    ">
                                <div className="text-[#016E5B]">
                                    <FaPlus />
                                </div>
                                <h4 className="text-black">Add New Module</h4>
                            </div>
                        </Link>
                    </div>



                </div>

                <div className="mt-10 ml-5 mx-auto flex mr-5 w-full flex-wrap gap-5 ">
                    {Data?.length > 0 && Data.map((item) => {
                        const videoCount = item.videos ? item.videos.length : 0; // Handle undefined videos
                        const completionRate = item.overallCompletionPercentage || 0; // Handle undefined completion rate
                        return (
                            <RoundModule
                                key={item.moduleId}
                                initialProgress={completionRate.toString()}
                                title={item.moduleName}
                                Module={`No. of videos: ${videoCount}`}
                               
                                complete={`Completion Rate: ${completionRate}%`}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    )
}

export default ModuleData
