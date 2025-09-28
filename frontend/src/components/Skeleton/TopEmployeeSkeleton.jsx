const TopEmployeeSkeleton = () => {
    return (
        <div role="status" className="h-[360px] w-[600px] border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-pulse">
            {/* Header skeleton */}
            <div className="h-12 bg-gray-200 border-b border-gray-300 flex items-center justify-between px-4">
                <div className="w-40 h-4 bg-gray-300 rounded"></div>
                <div className="w-16 h-4 bg-gray-300 rounded"></div>
            </div>
            
            {/* Content area */}
            <div className="p-4 space-y-4">
                {/* Employee list skeleton */}
                {[1, 2, 3, 4, 5].map((item) => (
                    <div key={item} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                            <div className="w-24 h-3 bg-gray-300 rounded"></div>
                            <div className="w-16 h-2 bg-gray-300 rounded"></div>
                        </div>
                        <div className="w-12 h-3 bg-gray-300 rounded"></div>
                    </div>
                ))}
            </div>
            
            <span className="sr-only">Loading employee data...</span>
        </div>
    );
};

export default TopEmployeeSkeleton;
