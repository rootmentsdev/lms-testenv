/**
 * Module Bar Component
 * 
 * Displays module information card with title, module name, duration, and completion status
 * Includes a "View Details" button
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Module title
 * @param {string} props.Module - Module name
 * @param {string} props.duration - Duration information
 * @param {string} props.complete - Completion status text
 * @returns {JSX.Element} - Module bar card component
 */
import "react-circular-progressbar/dist/styles.css";

/**
 * Route path for view details
 */
const VIEW_DETAILS_PATH = '#'; // Update with actual path when needed

/**
 * Module Bar Component
 */
const ModuleBar = ({ title, Module, duration, complete }) => {
    return (
        <div className="card w-96 h-40 border border-gray-300 shadow-md flex justify-start cursor-pointer mt-10 ml-2 rounded-lg hover:shadow-lg transition-shadow">
            <div className="flex justify-start items-start flex-col">
                <div className="flex">
                    <div className="flex flex-row ml-10 items-center space-y-4">
                        <div>
                            <h4 className="text-2xl text-black font-semibold">{title || 'Untitled Module'}</h4>
                            {Module && <p className="text-gray-600">{Module}</p>}
                            {duration && <p className="text-gray-600">{duration}</p>}
                            {complete && <p className="text-gray-600">{complete}</p>}

                            {/* View Details Button */}
                            <div className="flex w-32 border mt-4 border-[#016E5B] justify-evenly items-center py-1 rounded-lg cursor-pointer hover:bg-green-100 transition duration-200 ease-in-out">
                                <h4 className="text-black text-sm">View Details</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModuleBar;
