import Header from "../../components/Header/Header";
import { MdGroups2 } from "react-icons/md";
import { GiProgression } from "react-icons/gi";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { TiClipboard } from "react-icons/ti";
import { useEffect, useState } from "react";
import baseUrl from "../../api/api";

const HomeData = () => {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true); // Loading state

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(baseUrl.baseUrl + 'api/get/progress');
                if (!response.ok) {
                    throw new Error('Failed to fetch data');

                    // Handle HTTP errors
                }
                const result = await response.json(); // Parse JSON
                setData(result.data); // Assuming the data you need is inside 'result.data'
                setLoading(false); // Set loading to false\
                console.log(data);

            } catch (err) {
                console.error('Error fetching data:', err);
                setLoading(false); // Stop loading
            }
        };

        fetchData();

    }, []);


    return (
        <div>
            <div>
                <Header name='dashboard' />

            </div>
            <div className="ml-5 text-black">
                <div className="flex items-center gap-1 mt-5 font-semibold ">
                    <p>Hello, </p>
                    <h5>
                        <div className="text-xl text-[#016E5B]">
                            Admin
                        </div>
                    </h5>
                </div>
                <p>Your dashboard is ready, Let’s create a productive learning environment!</p>
            </div>
            {!loading && <div className="flex gap-2 justify-evenly mt-10">

                <div className="w-60 h-20 border-gray-300 border rounded-xl shadow-lg text-black flex justify-center items-center gap-3 cursor-pointer">
                    <div className="text-3xl bg-slate-200 p-3 rounded-full">
                        <MdGroups2 />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="flex justify-self-center ml-8 text-2xl font-bold text-[#016E5B]">
                            {data?.userCount}
                        </h2>
                        <p>Total employee</p>
                    </div>

                </div>
                <div className="w-60 h-20 border-gray-300 border rounded-xl shadow-lg text-black flex justify-center items-center gap-3 cursor-pointer">
                    <div className="text-3xl bg-slate-200 p-3 rounded-full">
                        <GiProgression />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="flex justify-self-center ml-8 text-2xl font-bold text-[#016E5B]">
                            {data?.averageProgress}%
                        </h2>
                        <p>Training progress</p>
                    </div>

                </div>
                <div className="w-60 h-20 border-gray-300 border rounded-xl shadow-lg text-black flex justify-center items-center gap-3 cursor-pointer">
                    <div className="text-3xl bg-slate-200 p-3 rounded-full">
                        <HiOutlineBuildingOffice2 />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="flex justify-self-center ml-8 text-2xl font-bold text-[#016E5B]">
                            {data?.branchCount}+
                        </h2>
                        <p>Total Branch</p>
                    </div>

                </div>
                <div className="w-60 h-20 border-gray-300 border rounded-xl shadow-lg text-black flex justify-center items-center gap-3 cursor-pointer">
                    <div className="text-3xl bg-slate-200 p-3 rounded-full">
                        <TiClipboard />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="flex justify-self-center ml-8 text-2xl font-bold text-[#016E5B]">
                            {data?.assessmentCount}
                        </h2>
                        <p>pending Assessment</p>
                    </div>

                </div>
            </div>}
        </div>
    )
}

export default HomeData