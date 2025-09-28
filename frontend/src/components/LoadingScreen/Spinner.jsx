import React from 'react';

const Spinner = ({ size = 'medium', color = 'primary' }) => {
    const sizeClasses = {
        small: 'w-4 h-4',
        medium: 'w-8 h-8',
        large: 'w-12 h-12',
        xlarge: 'w-16 h-16'
    };

    const colorClasses = {
        primary: 'border-[#016E5B]',
        secondary: 'border-[#01997A]',
        white: 'border-white',
        gray: 'border-gray-400'
    };

    return (
        <div className={`${sizeClasses[size]} ${colorClasses[color]} border-4 border-gray-200 rounded-full animate-spin`}>
            <span className="sr-only">Loading...</span>
        </div>
    );
};

export default Spinner;
