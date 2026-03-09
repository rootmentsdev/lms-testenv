import React from "react";
import { FaGlobe, FaSync } from "react-icons/fa";
import { useGetLMSStatsQuery } from "../../features/dashboard/dashboardApi";

const LMSWebsiteLoginStats = () => {
    // Use RTK Query for automatic caching and loading with polling config
    const { data: responseData, isLoading: loading, isFetching, refetch } = useGetLMSStatsQuery(undefined, {
        pollingInterval: 10000,
        refetchOnMountOrArgChange: true
    });

    const lmsStats = responseData?.data || {
        totalLMSLogins: 0,
        activeLMSSessions: 0,
        recentLMSLogins: 0
    };

    if (loading) {
        return (
            <div className="lg:w-56 w-48 md:w-52 h-28 relative border-gray-300 border rounded-xl shadow-lg text-black flex flex-col justify-center items-center gap-3 cursor-pointer sm:mr-4">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-12"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="lg:w-56 w-48 md:w-52 h-28 relative border-green-600 border-2 rounded-xl shadow-lg text-black flex flex-col justify-center items-center gap-3 cursor-pointer sm:mr-4">
            <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); refetch(); }}
                className={`absolute bottom-3 right-3 text-gray-400 hover:text-green-600 transition-colors ${isFetching ? 'animate-spin' : ''} z-10`}
                title="Refresh"
            >
                <FaSync size={10} />
            </button>
            <div className="flex gap-3">
                <div className="text-xl mt-[2px] absolute top-2 right-2 bg-green-100 h-10 w-10 rounded-full flex items-center justify-center">
                    <FaGlobe />
                </div>
                <div className="flex flex-col absolute top-5 left-2 w-10">
                    <p className="text-sm text-black">LMS</p>
                    <h2 className="md:text-2xl sm:text-lg font-bold text-green-600 w-[100px]">
                        {responseData ? (responseData.data?.totalLMSLogins ?? 0) : "Loading..."}
                    </h2>
                    <p className="text-xs text-gray-900 mt-1">
                        Logins
                    </p>
                </div>
            </div>
        </div>
    );
};

export default React.memo(LMSWebsiteLoginStats);
