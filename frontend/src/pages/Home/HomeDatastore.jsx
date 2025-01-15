


import Header from "../../components/Header/Header";

import { useEffect, useState } from "react";
import baseUrl from "../../api/api";
import SideNav from "../../components/SideNav/SideNav";

const HomeDatastore = ({ user }) => {
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
    }, []);



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
                                    {!loading && (user.role)}
                                </div>
                            </h5>
                        </div>
                        <p className="text-sm md:text-lg">Your dashboard is ready, Let’s create a productive learning environment!</p>
                    </div>
                </div>
            </div>



        </div >
    );
};

export default HomeDatastore;
