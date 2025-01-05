import Header from "../../components/Header/Header";
import { IoIosArrowBack } from "react-icons/io";
import { Link, useParams, useNavigate } from "react-router-dom";
import RoundModule from "../../components/RoundBar/RoundModule";
import { FaTrashAlt } from "react-icons/fa";
import { useEffect, useState } from "react";
import baseUrl from "../../api/api";
import { toast } from "react-toastify";

const AssingOrdeletedata = () => {
    const { id } = useParams(); // Get training ID from URL params
    const [training, setTraining] = useState(null);
    const navigate = useNavigate(); // Hook for navigation

    useEffect(() => {
        const fetchTrainingDetails = async () => {
            try {
                const response = await fetch(`${baseUrl.baseUrl}api/trainings/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch training details');
                }
                const result = await response.json();
                setTraining(result);
                console.log(result);

            } catch (err) {
                console.error(err);
            }
        };

        fetchTrainingDetails();
    }, [id]);

    const HandleDelete = async () => {
        try {
            const response = await fetch(`${baseUrl.baseUrl}api/user/delete/training/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete training');
            }

            // Redirect to the 'AssigData' page after successful deletion
            navigate('/training');
        } catch (err) {
            console.error('Error deleting training:', err);
        }
    };
    const handleReassign = () => {

        toast.warning("Reassign only in computer screen or big screen like tab ,laptop ...")

    }
    return (
        <div className="w-full h-full bg-white">
            <div><Header name='Assign or Delete training' /></div>

            <Link to={'/training'}>
                <div className=" flex items-center gap-1 m-5 text-black cursor-pointer">
                    <IoIosArrowBack />
                    <p>Back</p>
                </div>
            </Link>
            <div className="md:w-auto w-full md:h-52  border-2 rounded-xl shadow-lg md:mx-20 flex justify-between">
                <div className="text-black mt-6 ml-6">
                    <h2 className="font-semibold mb-3 ">Training Name : {training?.data.trainingName}</h2>
                    <div className="flex flex-col gap-1 md:text-md text-sm">
                        <p>No. of Modules : {training?.data.numberOfModules}</p>
                        <p>No. of user  : {training?.users.length}</p>
                        <p>  Trainingtype : {training?.data.Trainingtype}</p>
                        <p>Created Date: {new Date(training?.data.createdDate).toLocaleString()}</p>
                        <p>Deadline: {String(training?.data.deadline).length === 2 ? training?.data.deadline : new Date(training?.data.deadline).toLocaleString()}</p>
                    </div>
                </div>
                <div className="mt-32 mr-5">
                    <div className="flex gap-2 flex-col md:flex-row">
                        <Link to={`/Trainingdetails/${id}`}>
                            <button className="border p-2 rounded-md text-black">View More Details</button>
                        </Link>
                        <Link className="hidden md:block" to={`/Reassign/${id}`}>
                            <button className="border p-2 text-white rounded-md bg-[#016E5B]">Reassign Training</button>
                        </Link>

                        <button className="border p-2 block md:hidden text-white rounded-md bg-[#016E5B]" onClick={handleReassign}>Reassign Training</button>

                    </div>
                </div>
            </div>

            <div className="ml-10 mt-10 text-2xl font-semibold text-black flex">
                <h2>Modules</h2>
            </div>

            <div className="mt-5 md:ml-10 mx-2 flex flex-wrap gap-3 ">
                {
                    training?.data.modules.map((item) => {
                        // Find the user module progress based on module ID
                        const userModule = training.users[0]?.modules.find((mod) => mod.moduleId === item._id);

                        return (
                            <RoundModule
                                key={item?._id}
                                title={item?.moduleName}
                                initialProgress={userModule?.completionPercentage || "0.00"} // Fallback to 0 if no data
                                Module={`No. of videos: ${item?.videos.length}`}
                                duration={`Created at: ${new Date(item?.createdAt).toLocaleString()}`}
                                complete={`Created by HR`}
                            />
                        );
                    })
                }
            </div>

            <div onClick={() => document.getElementById('my_modal_1').showModal()} className=" ml-10 mt-10 text-md font-semibold mb-10 text-red-500 flex items-center gap-1 cursor-pointer">
                <FaTrashAlt />  <h2> Delete Training</h2>
            </div>

            <dialog id="my_modal_1" className="modal">
                <div className="modal-box bg-white text-black">
                    <h3 className="font-bold text-lg">Delete Training!</h3>
                    <p className="py-4">Do you want to delete the training <span className="text-xl text-red-500">{training?.data.trainingName}</span>?</p>
                    <div className="modal-action">
                        <form method="dialog" className="flex gap-10">
                            <button type="button" onClick={HandleDelete} className="btn btn-error text-white">Delete</button>
                            <button className="btn btn-success text-white">Close</button>
                        </form>
                    </div>
                </div>
            </dialog>
        </div>
    );
}

export default AssingOrdeletedata;
