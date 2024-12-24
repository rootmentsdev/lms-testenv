import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css"; // Import the styles

const RoundProgressBarAssessment = ({ initialProgress, title, Module, duration, complete }) => {
    // Initialize the progress state
    const progress = initialProgress

    // Handle the input change
    // const handleInputChange = (e) => {
    //     let value = parseInt(e.target.value, 10);
    //     // Ensure value is between 0 and 100
    //     if (value >= 0 && value <= 100) {
    //         setProgress(value);
    //     }
    // };

    return (
        //

        <div className="card w-96 h-40 shadow-lg rounded-lg flex items-center border border-gray-300 hover:shadow-xl transition-shadow duration-300 relative p-4">
            {/* Content Section */}
            <div className="flex flex-col space-y-2">
                <h4 className="text-2xl text-black font-semibold">{title}</h4>
                <p className="text-sm text-gray-500">{Module}</p>
                <p className="text-sm text-gray-500">{duration}</p>
                <p className="text-sm text-gray-500">{complete}</p>

                {/* View Details Button */}
                <div className="flex w-32 border-2 mt-4 border-green-600 justify-center items-center py-1 rounded-lg cursor-pointer hover:bg-green-100">
                    <h4 className="text-black text-sm font-medium">View Details</h4>
                </div>
            </div>

            {/* Circular Progress Bar */}
            <div style={{ width: 70, height: 70 }} className="absolute top-4 right-4">
                <CircularProgressbar
                    value={progress}
                    text={`${progress}%`}
                    styles={buildStyles({
                        pathColor: "green",       // Green progress path
                        textColor: "#333",        // Text color
                        trailColor: "#e2e8f0",    // Light gray trail
                        strokeWidth: 8,           // Path thickness
                    })}
                />
            </div>
        </div>

    );
};

export default RoundProgressBarAssessment;
