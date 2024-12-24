import Header from "../../components/Header/Header"
import { IoIosArrowBack } from "react-icons/io";
import { Link } from "react-router-dom";
import RoundModule from "../../components/RoundBar/RoundModule";
import { FaTrashAlt } from "react-icons/fa";

const AssingOrdeletedata = () => {
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
                    <h2 className="font-semibold mb-3 ">Training Name : Customer Interaction</h2>
                    <div className="flex flex-col gap-1">
                        <p>No. of Modules : 12</p>
                        <p>Duration : 01 : 56 hr</p>
                        <p>Completion Rate : 86%</p>
                        <p>Duration : 01 : 56 hr</p>
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
                <RoundModule initialProgress='40' title='Module 1' Module='No. of video : 12' duration='Duration : 01 : 56 hr' complete='Completion Rate : 40%' />
                <RoundModule initialProgress='80' title='Module 2' Module='No. of video : 12' duration='Duration : 01 : 56 hr' complete='Completion Rate : 80%' />
                <RoundModule initialProgress='90' title='Module 3' Module='No. of video : 12' duration='Duration : 01 : 56 hr' complete='Completion Rate : 90%' />
            </div>

            <div className="ml-10 mt-10 text-md  font-semibold text-red-500 flex items-center gap-1 cursor-pointer">
                <FaTrashAlt />  <h2> Delete Traning</h2>
            </div>

        </div>


    )
}

export default AssingOrdeletedata