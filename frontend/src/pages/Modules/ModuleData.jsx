import Header from "../../components/Header/Header"
import RoundModule from "../../components/RoundBar/RoundModule"
import { FaPlus } from "react-icons/fa";


const ModuleData = () => {
    return (
        <div className="w-full h-full bg-white">
            <div><Header name='Module' /></div>
            <div>

                <div className="flex mx-10 justify-between mt-10 ">
                    <div className="flex w-56 border-2 justify-evenly items-center py-2 ml-10 cursor-pointer
                                    ">
                        <div className="text-green-500">
                            <FaPlus />
                        </div>
                        <h4 className="text-black">Add New Module</h4>
                    </div>

                </div>
            </div>

            <div className="mt-10 ml-10 flex flex-wrap gap-3">

                <RoundModule initialProgress='40' title='Module 1' Module='No. of video : 12' duration='Duration : 01 : 56 hr' complete='Completion Rate : 40%' />
                <RoundModule initialProgress='80' title='Module 2' Module='No. of video : 12' duration='Duration : 01 : 56 hr' complete='Completion Rate : 80%' />
                <RoundModule initialProgress='90' title='Module 3' Module='No. of video : 12' duration='Duration : 01 : 56 hr' complete='Completion Rate : 90%' />

                <RoundModule initialProgress='20' title='Module 4' Module='No. of video : 12' duration='Duration : 01 : 56 hr' complete='Completion Rate : 20%' />
                <RoundModule initialProgress='40' title='Module 5' Module='No. of video : 12' duration='Duration : 01 : 56 hr' complete='Completion Rate : 40%' />
                <RoundModule initialProgress='80' title='Module 6' Module='No. of video : 12' duration='Duration : 01 : 56 hr' complete='Completion Rate : 80%' />
                <RoundModule initialProgress='90' title='Module 7' Module='No. of video : 12' duration='Duration : 01 : 56 hr' complete='Completion Rate : 90%' />

            </div>
        </div>
    )
}

export default ModuleData