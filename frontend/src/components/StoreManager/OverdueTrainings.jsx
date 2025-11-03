/**
 * Overdue Trainings Component
 * 
 * Displays table of users with overdue trainings and assessments
 * Shows employee name, count of overdue trainings, and overdue assessments
 * 
 * @returns {JSX.Element} - Overdue trainings table component or loading state
 */
import { useGetStoreManagerDueDataQuery } from "../../features/dashboard/dashboardApi";

/**
 * Formats number with leading zeros
 * 
 * @param {number} value - Number to format
 * @param {number} length - Minimum length (default: 2)
 * @returns {string} - Formatted string with leading zeros
 */
const formatWithLeadingZeros = (value, length = 2) => {
    return String(value || 0).padStart(length, '0');
};

/**
 * Loading skeleton component
 */
const LoadingSkeleton = () => (
    <div
        role="status"
        className="flex items-center justify-center w-[600px] h-[400px] shadow-xl bg-slate-100 rounded-lg animate-pulse"
        aria-label="Loading overdue trainings"
    >
        <span className="sr-only">Loading overdue trainings...</span>
    </div>
);

/**
 * Empty state component
 */
const EmptyState = () => (
    <div className="w-[600px] border bg-white shadow-md rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Overdue Trainings</h3>
        <p className="text-gray-500 text-center py-8">No overdue trainings found</p>
    </div>
);

/**
 * Overdue Trainings Component
 */
const OverdueTrainings = () => {
    const { data: responseData, isLoading } = useGetStoreManagerDueDataQuery();
    const overdueUsers = responseData?.topOverdueUsers || [];

    // Loading state
    if (isLoading) {
        return <LoadingSkeleton />;
    }

    // Empty state
    if (overdueUsers.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="w-[600px] border bg-white shadow-md rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Overdue Trainings
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-gray-600 text-sm border-b">
                            <th className="py-2">Employee Name</th>
                            <th className="py-2">Trainings</th>
                            <th className="py-2">Assessments</th>
                        </tr>
                    </thead>
                    <tbody>
                        {overdueUsers.map((user, index) => {
                            const overdueTrainingsCount = user.overdueTrainings?.length || 0;
                            const overdueAssessmentsCount = user.overdueAssessments?.length || 0;

                            return (
                                <tr
                                    key={`overdue-${index}`}
                                    className="text-sm text-gray-800 border-b hover:bg-gray-50"
                                >
                                    <td className="py-2">{user.name || 'N/A'}</td>
                                    <td className="py-2 text-red-500 font-semibold">
                                        {formatWithLeadingZeros(overdueTrainingsCount)}
                                    </td>
                                    <td className="py-2 text-red-500 font-semibold">
                                        {formatWithLeadingZeros(overdueAssessmentsCount)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OverdueTrainings;
