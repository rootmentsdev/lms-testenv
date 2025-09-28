const NotificationSkeleton = () => {
    return (
        <div role="status" className="border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-pulse">
            {/* Header skeleton */}
            <div className="h-12 bg-gray-200 border-b border-gray-300 flex items-center justify-between px-4">
                <div className="w-28 h-4 bg-gray-300 rounded"></div>
                <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
            </div>
            
            {/* Notifications skeleton */}
            <div className="p-4 space-y-3">
                {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                            <div className="flex-1 space-y-2">
                                <div className="w-full h-3 bg-gray-300 rounded"></div>
                                <div className="w-3/4 h-2 bg-gray-300 rounded"></div>
                                <div className="w-16 h-2 bg-gray-300 rounded"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <span className="sr-only">Loading notifications...</span>
        </div>
    );
};

export default NotificationSkeleton;
