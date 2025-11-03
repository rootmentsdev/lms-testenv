/**
 * Home Skeleton Component
 * 
 * Loading placeholder for dashboard stat cards
 * Displays animated skeleton while data is being fetched
 * 
 * @returns {JSX.Element} - Skeleton loading component
 */
const HomeSkeleton = () => {
    return (
        <div 
            role="status" 
            className="flex items-center justify-center lg:justify-evenly w-full sm:w-48 md:w-52 lg:w-56 h-28 lg:gap-6 shadow-xl bg-gray-300 rounded-lg animate-pulse"
            aria-label="Loading dashboard data"
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
};

export default HomeSkeleton;
