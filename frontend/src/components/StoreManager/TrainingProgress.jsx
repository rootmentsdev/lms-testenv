/**
 * Training Progress Component
 * 
 * Displays training progress summary using a pie chart
 * Shows completed, in progress, and pending trainings
 * Displays total number of staff members
 * 
 * @returns {JSX.Element} - Training progress chart component or loading state
 */
import { PieChart, Pie, Cell } from 'recharts';
import { useGetStoreManagerDataQuery } from '../../features/dashboard/dashboardApi';

/**
 * Chart configuration constants
 */
const CHART_CONFIG = {
    width: 250,
    height: 250,
    outerRadius: 90,
    innerRadius: 60,
    paddingAngle: 0,
};

/**
 * Color constants for chart segments
 */
const CHART_COLORS = {
    COMPLETED: '#016E5B',
    IN_PROGRESS: '#009279',
    PENDING: '#0DBE9F',
};

/**
 * Default data structure
 */
const DEFAULT_DATA = {
    completedTrainings: { count: 0, data: [] },
    pendingTrainings: { count: 0, data: [] },
    dueTrainings: { count: 0, data: [] },
    userconut: { count: 0 },
};

/**
 * Processes raw API data into structured format
 * 
 * @param {Object} rawData - Raw data from API
 * @returns {Object} - Processed data with defaults
 */
const processData = (rawData) => {
    if (!rawData) return DEFAULT_DATA;

    return {
        completedTrainings: rawData.completedTrainings || DEFAULT_DATA.completedTrainings,
        pendingTrainings: rawData.pendingTrainings || DEFAULT_DATA.pendingTrainings,
        dueTrainings: rawData.dueTrainings || DEFAULT_DATA.dueTrainings,
        userconut: rawData.userconut || DEFAULT_DATA.userconut,
    };
};

/**
 * Training Progress Component
 */
const TrainingProgress = () => {
    const { data: rawData, isLoading } = useGetStoreManagerDataQuery();
    const processedData = processData(rawData);

    /**
     * Chart data configuration
     */
    const chartData = [
        {
            name: 'Completed',
            value: processedData.completedTrainings.count,
            color: CHART_COLORS.COMPLETED,
        },
        {
            name: 'In Progress',
            value: processedData.dueTrainings.count,
            color: CHART_COLORS.IN_PROGRESS,
        },
        {
            name: 'Pending',
            value: processedData.pendingTrainings.count,
            color: CHART_COLORS.PENDING,
        },
    ];

    // Loading state
    if (isLoading) {
        return (
            <div
                role="status"
                className="flex items-center justify-center w-[600px] h-[400px] shadow-xl bg-slate-100 rounded-lg animate-pulse"
                aria-label="Loading training progress chart"
            >
                <span className="sr-only">Loading chart...</span>
            </div>
        );
    }

    const staffCount = processedData.userconut.count || 0;

    return (
        <div className="relative flex items-center border justify-between w-[600px] p-6 bg-white rounded-lg shadow-md">
            {/* Legend Section */}
            <div className="flex flex-col items-start space-y-4 ml-4 text-[#016E5B]">
                <h3 className="text-lg font-semibold mb-4">Training Progress Summary</h3>
                {chartData.map((item, index) => (
                    <div key={`legend-${index}`} className="flex items-center mt-4 space-x-4 text-sm">
                        <span
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: item.color }}
                            aria-label={`${item.name} indicator`}
                        />
                        <div className="flex justify-between w-[160px]">
                            <span>{item.name}</span>
                            <span className="font-semibold">{item.value || 0}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pie Chart Section */}
            <div className="flex flex-col items-center">
                <div className="relative">
                    <PieChart width={CHART_CONFIG.width} height={CHART_CONFIG.height}>
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={CHART_CONFIG.outerRadius}
                            innerRadius={CHART_CONFIG.innerRadius}
                            paddingAngle={CHART_CONFIG.paddingAngle}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                        <p className="text-sm text-black font-semibold">No. of Staffs</p>
                        <p className="text-2xl font-bold text-[#016E5B]">{staffCount}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainingProgress;
