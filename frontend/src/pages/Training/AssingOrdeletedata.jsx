import Header from "../../components/Header/Header"
import { IoIosArrowBack } from "react-icons/io";
import { Link, useParams } from "react-router-dom";
import RoundModule from "../../components/RoundBar/RoundModule";
import { FaTrashAlt } from "react-icons/fa";
import { useEffect, useState } from "react";
import baseUrl from "../../api/api";

const AssingOrdeletedata = () => {
    const { id } = useParams(); // Get training ID from URL params
    const [training, setTraining] = useState(null);

    useEffect(() => {
        const fetchTrainingDetails = async () => {
            try {
                const response = await fetch(`${baseUrl.baseUrl}api/trainings/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch training details');
                }
                const result = await response.json();
                setTraining(result);

            } catch (err) {

                throw new Error(err)
            }
        };

        fetchTrainingDetails();
    }, [id]);
    return (
        <div className="w-full h-full bg-white">
            <div><Header name='Assign Training' /></div>

            <Link to={''}>
                <div className=" flex items-center gap-1 m-5 text-black cursor-pointer">
                    <IoIosArrowBack />
                    <p>Back</p>
                </div>
            </Link>
            <div className="w-auto h-48 border-2 rounded-xl shadow-lg mx-20 flex justify-between">
                <div className="text-black mt-6 ml-6">
                    <h2 className="font-semibold mb-3 ">Training Name : {training?.data.trainingName}</h2>
                    <div className="flex flex-col gap-1">
                        <p>No. of Modules : {training?.data.numberOfModules}</p>
                        <p>No. of user  : {training?.users.length}</p>
                        <p>Created Date: {new Date(training?.data.createdDate).toLocaleString()}</p>
                        <p>Deadline: {String(training?.data.deadline).length === 2 ? training?.data.deadline : new Date(training?.data.deadline).toLocaleString()}</p>



                    </div>
                </div>
                <div className="mt-32 mr-5">
                    <div className="flex gap-2 ">
                        <button className="border p-2 rounded-md text-black">View More Details</button>
                        <button className="border p-2 text-white rounded-md bg-green-700">Assign Training</button>
                    </div>
                </div>

            </div>

            <div className="ml-10 mt-10 text-2xl font-semibold text-black flex">
                <h2> modules</h2>
            </div>

            <div className="mt-5 ml-10 flex flex-wrap gap-3">
                {
                    training?.data.modules.map((item) => {
                        // Find the user module progress based on module ID
                        const userModule = training.users[0]?.modules.find((mod) => mod.moduleId === item._id);

                        return (
                            <RoundModule
                                key={item?._id}
                                title={item?.moduleName}
                                initialProgress={userModule?.moduleCompletionPercentage || "0.00"} // Fallback to 0 if no data
                                Module={`No. of videos: ${item?.videos.length}`}
                                duration={`Created at: ${new Date(item?.createdAt).toLocaleString()}`}
                                complete={`Created by HR`}
                            />
                        );
                    })
                }
            </div>

            <div className="ml-10 mt-10 text-md  font-semibold text-red-500 flex items-center gap-1 cursor-pointer">
                <FaTrashAlt />  <h2> Delete Traning</h2>
            </div>

        </div>


    )
}

export default AssingOrdeletedata