/**
 * LMS Website Login Statistics Component
 * 
 * Displays LMS website login statistics in a stat card
 * Shows unique LMS user count with loading state
 * 
 * @returns {JSX.Element} - Stat card component or loading skeleton
 */
import { FaGlobe } from "react-icons/fa";
import { useGetLMSStatsQuery } from "../../features/dashboard/dashboardApi";

/**
 * Default statistics values
 */
const DEFAULT_STATS = {
    uniqueLMSUserCount: 0,
    totalLMSLogins: 0,
    activeLMSSessions: 0,
    recentLMSLogins: 0,
};

/**
 * Loading skeleton component
 */
const LoadingSkeleton = () => (
    <div className="lg:w-56 w-48 md:w-52 h-28 relative border-gray-300 border rounded-xl shadow-lg text-black flex flex-col justify-center items-center gap-3 cursor-pointer sm:mr-4">
        <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-12"></div>
        </div>
    </div>
);

/**
 * LMS Website Login Statistics Component
 */
const LMSWebsiteLoginStats = () => {
    const { data: responseData, isLoading } = useGetLMSStatsQuery();
    const lmsStats = responseData?.data || DEFAULT_STATS;

    // Loading state
    if (isLoading) {
        return <LoadingSkeleton />;
    }

    const userCount = lmsStats.uniqueLMSUserCount || 0;

    return (
        <div className="lg:w-56 w-48 md:w-52 h-28 relative border-green-600 border-2 rounded-xl shadow-lg text-black flex flex-col justify-center items-center gap-3 cursor-pointer sm:mr-4">
            <div className="flex gap-3">
                <div className="text-xl absolute top-2 right-2 bg-green-100 h-10 w-10 rounded-full flex items-center justify-center">
                    <FaGlobe className="text-green-600" aria-hidden="true" />
                </div>
                <div className="flex flex-col absolute top-5 left-2 w-10">
                    <p className="text-sm text-black">LMS Website</p>
                    <h2 className="md:text-2xl sm:text-lg font-bold text-green-600">
                        {userCount}
                    </h2>
                    <p className="text-xs text-gray-900">Logins</p>
                </div>
            </div>
        </div>
    );
};

export default LMSWebsiteLoginStats;
