const HomeSkeleton = () => {
    return (
        <div role="status" className="relative w-full sm:w-48 md:w-52 lg:w-56 h-28 border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {/* Main skeleton background */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse"></div>
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 shimmer opacity-30"></div>
            
            {/* Icon placeholder */}
            <div className="absolute top-2 right-2 w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
            
            {/* Text placeholders */}
            <div className="absolute top-5 left-2 space-y-2">
                <div className="w-16 h-3 bg-gray-300 rounded animate-pulse"></div>
                <div className="w-12 h-6 bg-gray-300 rounded animate-pulse"></div>
            </div>
            
            <span className="sr-only">Loading...</span>
        </div>
    );
}

export default HomeSkeleton;
