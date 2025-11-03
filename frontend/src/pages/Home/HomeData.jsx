/**
 * Home Data Component (Super Admin Dashboard)
 * 
 * Main dashboard page for super admin users
 * Displays stat cards, charts, top performers, notifications, and quick actions
 * 
 * @param {Object} props - Component props
 * @param {Object} props.user - Current user object from Redux
 * @returns {JSX.Element} - Dashboard component
 */
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { GiProgression } from "react-icons/gi";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { MdOutlinePendingActions } from "react-icons/md";
import { RiIdCardLine } from "react-icons/ri";

import Header from "../../components/Header/Header";
import SideNav from "../../components/SideNav/SideNav";
import HomeSkeleton from "../../components/Skeleton/HomeSkeleton";
import HomeBar from "../../components/HomeBar/HomeBar";
import TopEmployeeAndBranch from "../../components/TopEmployeeAndBranch/TopEmployeeAndBranch";
import Notification from "../../components/Notification/Notification";
import Quick from "../../components/Quick/Quick";
import LMSWebsiteLoginStats from "../../components/LMSWebsiteLoginStats/LMSWebsiteLoginStats";
import { useGetDashboardProgressQuery, useGetEmployeeCountQuery } from "../../features/dashboard/dashboardApi";

/**
 * Route path constants
 */
const ROUTE_PATHS = {
    EMPLOYEE: '/employee',
    TRAINING: '/training',
    BRANCH: '/branch',
    OVERDUE_ASSESSMENT: '/admin/overdue/assessment',
    OVERDUE_TRAINING: '/admin/overdue/training',
};

/**
 * Formats user role for display
 * 
 * @param {string} role - User role string
 * @returns {string} - Formatted role string
 */
const formatUserRole = (role) => {
    if (!role) return '';
    return role.replace('_', ' ');
};

/**
 * Rounds percentage value
 * 
 * @param {number} value - Percentage value
 * @returns {number} - Rounded percentage
 */
const roundPercentage = (value) => {
    return Math.round(value || 0);
};

/**
 * Stat Card Component
 * 
 * @param {Object} props - Stat card props
 * @returns {JSX.Element} - Stat card component
 */
const StatCard = ({ icon: Icon, label, value, link, isOverdue = false }) => {
    const cardClassName = isOverdue
        ? "lg:w-56 w-48 text-red-600 md:w-52 h-28 relative border-red-600 border-2 rounded-xl shadow-lg flex flex-col justify-center items-center gap-3 cursor-pointer sm:mr-4"
        : "lg:w-56 w-48 md:w-52 h-28 relative border-gray-300 border rounded-xl shadow-lg text-black flex flex-col justify-center items-center gap-3 cursor-pointer sm:mr-4";

    const valueClassName = isOverdue
        ? "md:text-2xl sm:text-lg font-bold"
        : "md:text-2xl sm:text-lg font-bold text-[#016E5B]";

    const cardContent = (
        <div className={cardClassName}>
            <div className="flex gap-3">
                <div className="text-xl absolute top-2 right-2 bg-slate-200 h-10 w-10 rounded-full flex items-center justify-center">
                    <Icon />
                </div>
                <div className="flex flex-col absolute top-5 left-2 w-10">
                    <p className={`text-sm ${isOverdue ? 'text-black' : ''}`}>{label}</p>
                    <h2 className={valueClassName}>{value}</h2>
                </div>
            </div>
        </div>
    );

    if (link) {
        return (
            <Link to={link}>
                {cardContent}
            </Link>
        );
    }

    return cardContent;
};

/**
 * Empty state component
 */
const EmptyState = () => (
    <div className="text-center py-8 mb-4">
        <div className="text-red-600 text-lg font-semibold mb-2">
            ⚠️ Dashboard Data Unavailable
        </div>
        <p className="text-gray-600">
            Unable to load dashboard data. Please check your connection and try refreshing the page.
        </p>
        <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#016E5B] text-white rounded-lg hover:bg-[#014f42] transition-colors"
        >
            Refresh Dashboard
        </button>
    </div>
);

/**
 * Loading skeleton row
 */
const LoadingSkeletons = () => (
    <div className="flex mb-[70px] gap-3 lg:gap-10 mx-10 lg:mx-15 md:flex-wrap flex-wrap sm:w-full md:gap-9 md:mx-10 md:justify-start mt-10 font-semibold">
        <HomeSkeleton />
        <HomeSkeleton />
        <HomeSkeleton />
        <HomeSkeleton />
        <HomeSkeleton />
    </div>
);

/**
 * Home Data Component
 */
const HomeData = ({ user }) => {
    // Fetch data using RTK Query
    const { data: progressData, isLoading: progressLoading } = useGetDashboardProgressQuery();
    const { data: employeeData, isLoading: employeeLoading } = useGetEmployeeCountQuery();

    // Extract and process data
    const dashboardData = progressData?.data || {};
    const employeeCount = employeeData?.data?.length || dashboardData?.userCount || 0;
    const isLoading = progressLoading || employeeLoading;
    const hasData = Object.keys(dashboardData).length > 0;

    /**
     * Stat cards configuration
     */
    const statCards = useMemo(() => [
        {
            id: 'employee',
            icon: RiIdCardLine,
            label: 'Total employee',
            value: employeeCount,
            link: ROUTE_PATHS.EMPLOYEE,
        },
        {
            id: 'training',
            icon: GiProgression,
            label: 'Training progress',
            value: `${roundPercentage(dashboardData?.averageProgress)}%`,
            link: ROUTE_PATHS.TRAINING,
        },
        {
            id: 'branch',
            icon: HiOutlineBuildingOffice2,
            label: 'Total Branches',
            value: dashboardData?.branchCount || 0,
            link: ROUTE_PATHS.BRANCH,
        },
        {
            id: 'overdue-assessment',
            icon: MdOutlinePendingActions,
            label: 'Overdue Assessment',
            value: dashboardData?.assessmentProgress || 0,
            link: ROUTE_PATHS.OVERDUE_ASSESSMENT,
            isOverdue: true,
        },
        {
            id: 'overdue-training',
            icon: MdOutlinePendingActions,
            label: 'Overdue Training',
            value: dashboardData?.trainingPending || 0,
            link: ROUTE_PATHS.OVERDUE_TRAINING,
            isOverdue: true,
        },
    ], [employeeCount, dashboardData]);

    return (
        <div className="mx-0 mb-[90px]">
            <Header name="Dashboard" />

            <div className="flex">
                <SideNav />

                <div className="md:ml-[100px] mt-[100px]">
                    {/* Greeting Section */}
                    <div className="ml-12 text-black">
                        <div className="flex items-center gap-3 mt-5 mb-4">
                            <div className="flex items-center gap-2">
                                <p className="text-lg font-medium text-gray-700">Hello,</p>
                                <div className="bg-gradient-to-r from-[#016E5B] to-[#01997A] text-white px-4 py-2 rounded-full shadow-lg">
                                    <span className="text-lg font-bold capitalize">
                                        {formatUserRole(user?.role)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm md:text-lg">
                            Your dashboard is ready, Let's create a productive learning environment!
                        </p>
                    </div>

                    {/* Loading State */}
                    {isLoading && <LoadingSkeletons />}

                    {/* Content State */}
                    {!isLoading && (
                        <>
                            {!hasData && <EmptyState />}

                            {hasData && (
                                <div className="flex mb-[70px] gap-3 lg:gap-6 mx-10 lg:mx-15 md:flex-wrap flex-wrap sm:w-full md:gap-9 md:mx-10 md:justify-start mt-10 font-semibold">
                                    {statCards.map((card) => (
                                        <StatCard key={card.id} {...card} />
                                    ))}
                                    <LMSWebsiteLoginStats />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Charts Section */}
            <div className="flex gap-20">
                <HomeBar />
                <div className="h-[360px] w-[600px] rounded-xl">
                    <TopEmployeeAndBranch />
                </div>
            </div>

            {/* Quick Actions and Notifications */}
            <div className="flex ml-[200px] gap-52">
                <Quick />
                <Notification />
            </div>
        </div>
    );
};

export default HomeData;
