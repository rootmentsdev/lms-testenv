const QuickSkeleton = () => {
    return (
        <div role="status" className="border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-pulse">
            {/* Header skeleton */}
            <div className="h-12 bg-gray-200 border-b border-gray-300 flex items-center px-4">
                <div className="w-32 h-4 bg-gray-300 rounded"></div>
            </div>
            
            {/* Quick actions skeleton */}
            <div className="p-4 space-y-3">
                {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                        <div className="flex-1">
                            <div className="w-24 h-3 bg-gray-300 rounded mb-1"></div>
                            <div className="w-16 h-2 bg-gray-300 rounded"></div>
                        </div>
                        <div className="w-4 h-4 bg-gray-300 rounded"></div>
                    </div>
                ))}
            </div>
            
            <span className="sr-only">Loading quick actions...</span>
        </div>
    );
};

export default QuickSkeleton;
