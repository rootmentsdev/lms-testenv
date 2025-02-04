import { useEffect, useState } from "react";
import baseUrl from "../../../api/api";
import Select from "react-select";
import { useParams } from "react-router-dom";
import Header from "../../../components/Header/Header";
import SideNav from '../../../components/SideNav/SideNav';
// Users options

const ReassignData = () => {
    const { id } = useParams(); // Get training ID from URL params
    const [training, setTraining] = useState(null);
    const [assignedTo, setAssignedTo] = useState([]); // Multi-select values
    const [users, setUsers] = useState([]);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchTrainingDetails = async () => {
            try {
                const response = await fetch(`${baseUrl.baseUrl}api/trainings/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch training details');
                }
                const result = await response.json();
                setTraining(result);
                if (training) {
                    console.log(training)
                }

            } catch (err) {

                throw new Error(err)
            }
        };
        const fetchUsers = async () => {
            try {
                const endpoint = "api/usercreate/getAllUser"

                const response = await fetch(`${baseUrl.baseUrl}${endpoint}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" ,
                        'Authorization': `Bearer ${token}`, 
                    },
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                const data = await response.json();
                console.log(data);

                // Map users to options required by react-select

                const options = data.data.map((user) => ({
                    value: user._id,
                    label: "EmpId : " + user.empID + " " + " Name :  " + user.username,
                }));
                setUsers(options);



            } catch (error) {
                console.error("Failed to fetch users:", error.message);
            }
        };
        fetchTrainingDetails();
        fetchUsers()



    }, [id]);
    const HandleSubmit = async (e) => {
        e.preventDefault()
        console.log(assignedTo, id);
        // setAssignedTo({ ...assignedTo, id: id })

        try {
            const request = await fetch(baseUrl.baseUrl + 'api/user/reassign/training', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ assignedTo: assignedTo.map(user => user.value), trainingId: id }),
            });
            const response = await request.json()
            alert(response.message)
            window.location.reload();
        } catch (error) {
            throw new Error(error)
        }

    }
    return (
        <div className="w-full h-full bg-white text-black">
            <div><Header name='Reassign Training' /></div>
            <SideNav />

            <div className="md:ml-[100px] mt-[150px]">
                <div className="text-xl mt-10  ">
                    <div className="flex justify-evenly">
                        <p>Training Name: <span className="text-[#016E5B]">{training?.data.trainingName}</span></p>
                        <p>Number of Modules : <span className="text-[#016E5B]">{training?.data.numberOfModules}</span></p>
                        <p>Number of user : <span className="text-[#016E5B]">{training?.users.length}</span></p>
                    </div>
                </div>
                <div className="flex mx-32 justify-between ">
                    <div>
                        {
                            training?.data?.modules.map((module) => {
                                return (
                                    <div className="text-xl mt-5 " key={module._id}>
                                        Module {module.moduleName} has {module.videos.length} videos
                                        <ul className="text-[16px] text-[#016E5B]">
                                            {module.videos.map((video) => {
                                                return (
                                                    <li key={video._id} title={video.title}>
                                                        {video.title.length < 20 ? video.title : video.title.slice(0, 20) + "..."}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                );
                            })
                        }
                    </div>
                    <div className="mt-5 flex justify-start items-center">
                        <form action="" onSubmit={HandleSubmit} className="flex flex-col gap-5">
                            <div className="mt-5 flex justify-start items-center">
                                <div className="w-96">
                                    <Select
                                        placeholder="select or search"
                                        options={users}
                                        isMulti
                                        value={assignedTo}
                                        onChange={setAssignedTo} // Updates state
                                        className="w-full "
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn text-white btn-accent">
                                Reassign
                            </button>
                        </form>
                    </div>
                </div>
            </div>


        </div >
    )
}

export default ReassignData