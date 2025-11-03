/**
 * Home Bar Chart Component
 * 
 * Displays progress bar chart for training and assessment completion by branch
 * Allows toggling between Training and Assessment views
 * 
 * @returns {JSX.Element} - Bar chart component or loading/empty state
 */
import { useState, useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { useGetHomeProgressQuery } from "../../features/dashboard/dashboardApi";

/**
 * Chart dimensions and styling constants
 */
const CHART_CONFIG = {
    width: 600,
    height: 400,
    marginLeft: { mobile: 40, desktop: 150 },
    barSize: {
        small: 40,
        large: 20,
        threshold: 10,
    },
};

/**
 * Color constants
 */
const COLORS = {
    completed: '#016E5B',
    pending: '#E0E0E0',
    toggle: '#2E7D32',
    toggleHover: '#287468',
};

/**
 * Toggle options
 */
const TOGGLE_OPTIONS = {
    ASSESSMENT: 'assessment',
    TRAINING: 'training',
};

/**
 * Calculates percentage from parts and total
 * 
 * @param {number} part - Partial value
 * @param {number} total - Total value
 * @returns {number} - Percentage (0-100)
 */
const calculatePercentage = (part, total) => {
    if (!total || total === 0) return 0;
    return (part / total) * 100;
};

/**
 * Formats percentage to 2 decimal places
 * 
 * @param {number} value - Percentage value
 * @returns {string} - Formatted percentage string
 */
const formatPercentage = (value) => {
    return value.toFixed(2);
};

/**
 * Processes raw data for chart display
 * 
 * @param {Array} rawData - Raw data from API
 * @param {boolean} isAssessment - Whether showing assessment view
 * @returns {Array} - Processed chart data
 */
const processChartData = (rawData, isAssessment) => {
    return rawData.map((item) => {
        const totalTraining = item.completeTraining + item.pendingTraining;
        const totalAssessment = item.completeAssessment + item.pendingAssessment;

        const completedTraining = calculatePercentage(item.completeTraining, totalTraining);
        const pendingTraining = calculatePercentage(item.pendingTraining, totalTraining);
        const completedAssessment = calculatePercentage(item.completeAssessment, totalAssessment);
        const pendingAssessment = calculatePercentage(item.pendingAssessment, totalAssessment);

        return {
            name: item.locCode,
            Completed: isAssessment ? completedAssessment : completedTraining,
            Pending: isAssessment ? pendingAssessment : pendingTraining,
            customTooltipText: isAssessment
                ? `Branch: ${item.branchName}\nCompleted: ${formatPercentage(completedAssessment)}%\nPending: ${formatPercentage(pendingAssessment)}%`
                : `Branch: ${item.branchName}\nCompleted: ${formatPercentage(completedTraining)}%\nPending: ${formatPercentage(pendingTraining)}%`,
        };
    });
};

/**
 * Custom tooltip component for chart
 * 
 * @param {Object} props - Tooltip props from recharts
 * @param {boolean} props.active - Whether tooltip is active
 * @param {Array} props.payload - Tooltip payload data
 * @returns {JSX.Element|null} - Tooltip component or null
 */
const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    const { customTooltipText } = payload[0].payload;

    return (
        <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
            <p className="text-sm text-gray-700 whitespace-pre-line">
                {customTooltipText}
            </p>
        </div>
    );
};

/**
 * Empty state component
 */
const EmptyState = () => (
    <div className="md:ml-[150px] ml-10 w-[600px] h-[400px]">
        <div className="w-full h-full border border-gray-300 rounded-xl shadow-lg flex items-center justify-center">
            <p className="text-gray-500">No data available for chart</p>
        </div>
    </div>
);

/**
 * Loading skeleton component
 */
const LoadingSkeleton = () => (
    <div className="md:ml-[150px] ml-10 w-[600px] h-[400px]">
        <div
            role="status"
            className="flex items-center justify-center w-full h-full shadow-xl bg-slate-100 rounded-lg animate-pulse"
            aria-label="Loading chart data"
        >
            <span className="sr-only">Loading...</span>
        </div>
    </div>
);

/**
 * Home Bar Chart Component
 */
const HomeBar = () => {
    const [isShowingAssessment, setIsShowingAssessment] = useState(false);

    // Fetch data using RTK Query
    const { data: responseData, isLoading } = useGetHomeProgressQuery();
    const rawData = responseData?.data || [];

    /**
     * Handles toggle between Assessment and Training views
     */
    const handleToggle = () => {
        setIsShowingAssessment((prev) => !prev);
    };

    /**
     * Processed chart data using useMemo for performance
     */
    const chartData = useMemo(() => {
        return processChartData(rawData, isShowingAssessment);
    }, [rawData, isShowingAssessment]);

    /**
     * Determines bar size based on data length
     */
    const barSize = rawData.length < CHART_CONFIG.barSize.threshold
        ? CHART_CONFIG.barSize.small
        : CHART_CONFIG.barSize.large;

    // Loading state
    if (isLoading) {
        return <LoadingSkeleton />;
    }

    // Empty state
    if (chartData.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="md:ml-[150px] ml-10 w-[600px] h-[400px]">
            <div className="w-full h-full border border-gray-300 rounded-xl shadow-lg">
                {/* Toggle Controls */}
                <div className="flex justify-end mt-3 mx-3 text-[#2E7D32]">
                    <div className="flex gap-2 items-center">
                        <label htmlFor="view-toggle">Assessment</label>
                        <input
                            id="view-toggle"
                            type="checkbox"
                            className="toggle border-blue-500 bg-[#016E5B] [--tglbg:white] hover:bg-[#287468]"
                            onClick={handleToggle}
                            defaultChecked={!isShowingAssessment}
                            aria-label="Toggle between Assessment and Training view"
                        />
                        <label htmlFor="view-toggle">Training</label>
                    </div>
                </div>

                {/* Chart */}
                <ResponsiveContainer width="100%" height="95%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                        barSize={barSize}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `${value}%`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                        <Bar dataKey="Completed" stackId="a" fill={COLORS.completed} />
                        <Bar dataKey="Pending" stackId="a" fill={COLORS.pending} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default HomeBar;
