/**
 * Round Assessment Component
 * 
 * Displays assessment information with circular progress bar
 * Shows title, module name, user count, duration, deadline, completion status, and progress
 * 
 * @param {Object} props - Component props
 * @param {number} props.initialProgress - Initial progress percentage (0-100)
 * @param {string} props.title - Assessment title
 * @param {string} props.Module - Module name
 * @param {string} props.deadline - Deadline information
 * @param {string|number} props.duration - Duration in minutes
 * @param {string} props.complete - Completion status text
 * @param {string|number} props.user - Number of users
 * @returns {JSX.Element} - Round assessment card component
 */
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

/**
 * Title truncation limit
 */
const TITLE_MAX_LENGTH = 10;

/**
 * Progress bar styling configuration
 */
const PROGRESS_STYLES = {
    pathColor: "#016E5B",
    textColor: "#333",
    trailColor: "#e2e8f0",
    strokeWidth: 10,
};

/**
 * Progress bar dimensions
 */
const PROGRESS_SIZE = {
    width: 70,
    height: 70,
};

/**
 * Truncates text if exceeds maximum length
 * 
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text with ellipsis if needed
 */
const truncateTitle = (text, maxLength = TITLE_MAX_LENGTH) => {
    if (!text || text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
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
 * Formats duration with "Minutes" suffix
 * 
 * @param {string|number} duration - Duration value
 * @returns {string} - Formatted duration string
 */
const formatDuration = (duration) => {
    if (!duration) return '';
    return `Time : ${duration} Minutes`;
};

/**
 * Formats user count text
 * 
 * @param {string|number} userCount - User count value
 * @returns {string} - Formatted user count string
 */
const formatUserCount = (userCount) => {
    if (!userCount && userCount !== 0) return '';
    return `number of user : ${userCount}`;
};

/**
 * Round Assessment Component
 */
const RoundProgressBarAssessment = ({
    initialProgress,
    title,
    Module,
    deadline,
    duration,
    complete,
    user,
}) => {
    const progress = clampProgress(initialProgress || 0);
    const displayTitle = truncateTitle(title || '');

    return (
        <div className="card w-72 h-40 shadow-lg rounded-lg flex justify-center items-center cursor-pointer border border-gray-300 hover:shadow-xl transition-shadow duration-300">
            <div className="flex justify-center items-center flex-col p-4 w-full">
                <div className="flex w-full justify-between items-center">
                    {/* Text Content */}
                    <div className="flex flex-col space-y-1">
                        <h4 className="text-xl text-black font-semibold">
                            Title : {displayTitle || 'Untitled Assessment'}
                        </h4>
                        {Module && <p className="text-sm text-gray-500">{Module}</p>}
                        {user !== undefined && user !== null && (
                            <p className="text-sm text-gray-500">{formatUserCount(user)}</p>
                        )}
                        {duration && (
                            <p className="text-sm text-gray-500">{formatDuration(duration)}</p>
                        )}
                        {deadline && <p className="text-sm text-gray-500">{deadline}</p>}
                        {complete && <p className="text-sm text-gray-500">{complete}</p>}
                    </div>

                    {/* Circular Progress Bar */}
                    <div style={{ width: PROGRESS_SIZE.width, height: PROGRESS_SIZE.height }}>
                        <CircularProgressbar
                            value={progress}
                            text={`${progress}%`}
                            styles={buildStyles(PROGRESS_STYLES)}
                            aria-label={`Assessment progress: ${progress}%`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoundProgressBarAssessment;
