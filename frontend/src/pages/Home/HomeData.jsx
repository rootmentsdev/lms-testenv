import Header from "../../components/Header/Header";
import { MdGroups2 } from "react-icons/md";
import { GiProgression } from "react-icons/gi";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { TiClipboard } from "react-icons/ti";
import { useEffect, useState } from "react";
import baseUrl from "../../api/api";
import HomeSkeleton from "../../components/Skeleton/HomeSkeleton";
import SideNav from "../../components/SideNav/SideNav";
import { Link } from "react-router-dom";
import HomeBar from "../../components/HomeBar/HomeBar";
import TopEmployeeAndBranch from "../../components/TopEmployeeAndBranch/TopEmployeeAndBranch";
import Notification from "../../components/Notification/Notification";
import Quick from "../../components/Quick/Quick";

const HomeData = ({ user }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true); // Loading state

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(baseUrl.baseUrl + 'api/get/progress');
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const result = await response.json(); // Parse JSON
                setData(result.data); // Assuming the data you need is inside 'result.data'
                setLoading(false); // Set loading to false
                console.log(data);
            } catch (err) {
                console.error('Error fetching data:', err);
                setLoading(false); // Stop loading
            }
        };

        fetchData();
    }, [data]);



    return (
        <div className=" mx-0 mb-[90px]" >
            <div>
                <Header name="Dashboard" />
            </div>
            <div className="flex">
                <div>
                    <SideNav />
                </div>
                <div className="md:ml-[100px] mt-[100px] ">
                    <div className="ml-12 text-black">
                        <div className="flex items-center gap-1 mt-5 font-semibold ">
                            <p>Hello, </p>
                            <h5>
                                <div className="text-xl text-[#016E5B]">
                                    {user.role}
                                </div>
                            </h5>
                        </div>
                        <p className="text-sm md:text-lg">Your dashboard is ready, Let’s create a productive learning environment!</p>
                    </div>
                    {loading && (
                        <div className="flex mb-[70px] gap-3 lg:gap-6 mx-10 lg:mx-15 md:flex-wrap flex-wrap sm:w-full md:gap-9 md:mx-10 md:justify-start mt-10 font-semibold">
                            <HomeSkeleton />
                            <HomeSkeleton />
                            <HomeSkeleton />
                            <HomeSkeleton />
                        </div>
                    )}
                    {!loading && (
                        <div className="">
                            <div className="flex mb-[70px] gap-3 lg:gap-6 mx-10 lg:mx-15 md:flex-wrap flex-wrap sm:w-full md:gap-9  md:mx-10 md:justify-start mt-10 font-semibold">
                                <Link to={'/employee'}>
                                    <div className="lg:w-72 w-48 md:w-52 h-28 border-gray-300 border rounded-xl shadow-lg text-black flex flex-col justify-center items-center gap-3 cursor-pointer sm:mr-4">
                                        <div className="flex gap-3">
                                            <div className="text-3xl bg-slate-200 h-14 w-14 rounded-full flex items-center justify-center">
                                                <MdGroups2 />
                                            </div>
                                            <div className="flex flex-col items-center justify-center">
                                                <h2 className="md:text-3xl sm:text-lg font-bold text-[#016E5B]">
                                                    {data?.userCount}
                                                </h2>
                                                <p className="text-sm">Total employee</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                                <Link to={'/training'}>
                                    <div className="lg:w-72 w-48 md:w-52 h-28 border-gray-300 border rounded-xl shadow-lg text-black flex flex-col justify-center items-center gap-3 cursor-pointer sm:mr-4">
                                        <div className="flex gap-3">
                                            <div className="text-3xl bg-slate-200 h-14 w-14 rounded-full flex items-center justify-center">
                                                <GiProgression />
                                            </div>
                                            <div className="flex flex-col items-center justify-center">
                                                <h2 className="lg:text-3xl font-bold sm:text-lg text-[#016E5B]">
                                                    {data?.averageProgress}%
                                                </h2>
                                                <p className="text-sm">Training progress</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>

                                <Link to={'/branch'}>
                                    <div className="lg:w-72 w-48 md:w-52 h-28 border-gray-300 border rounded-xl shadow-lg text-black flex flex-col justify-center items-center gap-2 cursor-pointer sm:mr-4">
                                        <div className="flex gap-3">
                                            <div className="text-3xl bg-slate-200 h-14 w-14 rounded-full flex items-center justify-center">
                                                <HiOutlineBuildingOffice2 />
                                            </div>
                                            <div className="flex flex-col items-center justify-center">
                                                <h2 className="md:text-3xl font-bold sm:text-lg text-[#016E5B]">
                                                    {data?.branchCount}
                                                </h2>
                                                <p className="text-sm">Total Branch</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>

                                <Link to={'/assessments'}>
                                    <div className="lg:w-72 w-48 md:w-52 h-28 border-gray-300 border rounded-xl shadow-lg text-black flex flex-col justify-center items-center gap-3 cursor-pointer sm:mr-4">
                                        <div className="flex gap-3">
                                            <div className="text-3xl bg-slate-200 h-14 w-14 rounded-full flex items-center justify-center">
                                                <TiClipboard />
                                            </div>
                                            <div className="flex flex-col items-center justify-center">
                                                <h2 className="lg:text-3xl font-bold sm:text-lg text-[#016E5B]">
                                                    {data?.assessmentProgress}%
                                                </h2>
                                                <p className="text-sm">Pending Assessment</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex gap-20">
                <div>
                    <HomeBar />
                </div>
                <div className="h-[360px] w-[600px]  rounded-xl" >
                    <TopEmployeeAndBranch />


                </div>
            </div>
            <div className="flex ml-[200px] gap-10 justify-between">
                <div>
                    <Quick />
                </div>
                <div>
                    <Notification />
                </div>
            </div>


        </div >
    );
};

export default HomeData;
