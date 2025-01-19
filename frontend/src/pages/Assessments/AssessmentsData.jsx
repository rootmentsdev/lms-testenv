import Header from "../../components/Header/Header";
import { FaPlus } from "react-icons/fa";
import { useEffect, useState } from "react";
import RoundProgressBarAssessment from "../../components/RoundBar/RoundAssessment";
import { Link } from "react-router-dom";
import baseUrl from "../../api/api";
import SideNav from "../../components/SideNav/SideNav";

const AssessmentsData = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null); // Error handling
    const [loading, setLoading] = useState(true); // Loading indicator

    // Fetch Assessments Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${baseUrl.baseUrl}api/user/get/AllAssessment`);
                if (!response.ok) throw new Error('Failed to fetch data');

                const result = await response.json();

                // Sort data by completionPercentage in descending order
                const sortedData = result.data.sort(
                    (a, b) => a.completionPercentage - b.completionPercentage
                );


                setData(sortedData);
                console.log(sortedData);

            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load assessments'); // Set error state
            } finally {
                setLoading(false); // Stop loading indicator
            }
        };

        fetchData();
    }, []);

    return (
        <div className="w-full h-full bg-white">
            {/* Header */}
            <Header name='Assessments' />
            <SideNav />
            {/* Top Bar */}
            <div className="md:ml-[100px] mt-[150px]">
                <div className="flex md:mx-10 justify-between mt-10">
                    {/* Create Assessment */}
                    <Link to={'/create/Assessment'}>
                        <div className="flex w-56 border-2 justify-evenly items-center py-2 ml-10 cursor-pointer">
                            <div className="text-[#016E5B]"><FaPlus /></div>
                            <h4 className="text-black">Create New Assessment</h4>
                        </div>
                    </Link>
                    <Link to={'/assign/Assessment'}>
                        <div className="flex w-56 border-2 justify-evenly items-center py-2 ml-10 cursor-pointer">
                            <div className="text-[#016E5B]"><FaPlus /></div>
                            <h4 className="text-black">Assign Assessment</h4>
                        </div>
                    </Link>
                </div>

                {/* Assessment Cards */}
                <div className="mt-10 ml-10 flex flex-wrap gap-3">
                    {loading ? (
                        <div>Loading...</div>
                    ) : error ? (
                        <div className="text-red-500">{error}</div>
                    ) : (
                        data.map((item) => (
                            <Link to={`/Assessment/Assign/${item?.assessmentId}`} key={item.assessmentId}>
                                <div className="mt-5">
                                    <RoundProgressBarAssessment
                                        initialProgress={item.completionPercentage}
                                        deadline={`${item?.assessmentdeadline} days`}
                                        user={item.totalAssigned}
                                        duration={item.assessmentduration}
                                        Module={`Number of questions: ${item?.assessment}`}
                                        title={` ${item?.assessmentName}`}
                                        complete={`Complete rate ${item.completionPercentage}`}
                                    />
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssessmentsData;
