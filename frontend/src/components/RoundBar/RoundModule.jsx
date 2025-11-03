/**
 * Round Module Component
 * 
 * Displays module information with circular progress bar
 * Shows title, module name, completion status, and progress percentage
 * 
 * @param {Object} props - Component props
 * @param {number} props.initialProgress - Initial progress percentage (0-100)
 * @param {string} props.title - Module title
 * @param {string} props.Module - Module name
 * @param {string} props.complete - Completion status text
 * @returns {JSX.Element} - Round module card component
 */
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

/**
 * Progress bar styling configuration
 */
const PROGRESS_STYLES = {
    pathColor: "#016E5B",
    textColor: "#333",
    trailColor: "#e2e8f0",
    strokeWidth: 8,
};

/**
 * Progress bar dimensions
 */
const PROGRESS_SIZE = {
    width: 80,
    height: 80,
};

/**
 * Clamps progress value between 0 and 100
 * 
 * @param {number} progress - Progress value
 * @returns {number} - Clamped progress value
 */
const clampProgress = (progress) => {
    if (progress < 0) return 0;
    if (progress > 100) return 100;
    return Math.round(progress);
};

/**
 * Round Module Component
 */
const RoundModule = ({ initialProgress, title, Module, complete }) => {
    const progress = clampProgress(initialProgress || 0);

    return (
        <div className="card w-[360px] h-40 border border-gray-300 shadow-md flex justify-center items-center cursor-pointer mt-10 ml-2 rounded-lg hover:shadow-lg transition-shadow">
            <div className="flex justify-center items-center flex-col">
                <div className="flex">
                    <div className="flex flex-row mx-1 gap-10 items-center space-y-4">
                        <div className="m-3">
                            <h4 className="text-xl md:text-2xl text-black font-semibold">
                                {title || 'Untitled Module'}
                            </h4>
                            {Module && <p className="text-gray-600">{Module}</p>}
                            {complete && <p className="text-gray-600">{complete}</p>}
                        </div>

                        {/* Circular progress bar */}
                        <div style={{ width: PROGRESS_SIZE.width, height: PROGRESS_SIZE.height }}>
                            <CircularProgressbar
                                value={progress}
                                text={`${progress}%`}
                                styles={buildStyles(PROGRESS_STYLES)}
                                aria-label={`Module progress: ${progress}%`}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoundModule;
