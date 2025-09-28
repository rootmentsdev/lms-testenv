import React from 'react';

const LoadingScreen = ({ message = "Loading Dashboard..." }) => {
    return (
        <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="text-center">
                {/* Main Loading Spinner */}
                <div className="relative mb-8">
                    <div className="w-20 h-20 border-4 border-gray-200 border-t-[#016E5B] rounded-full animate-spin mx-auto"></div>
                    <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-[#01997A] rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
                </div>
                
                {/* Loading Message */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-[#016E5B] mb-2">
                        {message}
                    </h2>
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-2 h-2 bg-[#016E5B] rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-[#01997A] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-[#016E5B] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <p className="text-gray-600 text-sm max-w-md">
                        Preparing your dashboard with the latest data...
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mt-8 w-64 mx-auto">
                    <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-[#016E5B] to-[#01997A] h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
