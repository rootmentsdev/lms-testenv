const HomeBarSkeleton = () => {
    return (
        <div role="status" className="w-full h-[360px] border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-pulse">
            {/* Header skeleton */}
            <div className="h-12 bg-gray-200 border-b border-gray-300 flex items-center px-4">
                <div className="w-32 h-4 bg-gray-300 rounded"></div>
            </div>
            
            {/* Chart area skeleton */}
            <div className="p-4 space-y-4">
                <div className="h-6 w-24 bg-gray-300 rounded"></div>
                <div className="h-48 bg-gray-100 rounded-lg relative">
                    {/* Simulated chart bars */}
                    <div className="absolute bottom-0 left-4 w-8 bg-gray-300 h-16 rounded-t"></div>
                    <div className="absolute bottom-0 left-16 w-8 bg-gray-300 h-24 rounded-t"></div>
                    <div className="absolute bottom-0 left-28 w-8 bg-gray-300 h-12 rounded-t"></div>
                    <div className="absolute bottom-0 left-40 w-8 bg-gray-300 h-32 rounded-t"></div>
                    <div className="absolute bottom-0 left-52 w-8 bg-gray-300 h-20 rounded-t"></div>
                    <div className="absolute bottom-0 left-64 w-8 bg-gray-300 h-28 rounded-t"></div>
                </div>
                
                {/* Legend skeleton */}
                <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gray-300 rounded"></div>
                        <div className="w-16 h-3 bg-gray-300 rounded"></div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gray-300 rounded"></div>
                        <div className="w-16 h-3 bg-gray-300 rounded"></div>
                    </div>
                </div>
            </div>
            
            <span className="sr-only">Loading chart...</span>
        </div>
    );
};

export default HomeBarSkeleton;
