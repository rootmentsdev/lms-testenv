import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css"; // Import the styles

const RoundProgressBar = ({ initialProgress, title, Module, duration, complete }) => {
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

        <div className="card w-72 h-40 shadow-lg rounded-lg flex justify-center items-center cursor-pointer border border-gray-300 hover:shadow-xl transition-shadow duration-300">
            <div className="flex justify-center items-center flex-col p-4 w-full">
                <div className="flex w-full justify-between items-center">
                    {/* Text Content */}
                    <div className="flex flex-col space-y-2">
                        <h4 className="text-xl text-black font-semibold">{title}</h4>
                        <p className="text-sm text-gray-500">{Module}</p>
                        <p className="text-sm text-gray-500">{duration}</p>
                        <p className="text-sm text-gray-500">{complete}</p>
                    </div>

                    {/* Circular Progress Bar */}
                    <div style={{ width: 70, height: 70 }}>
                        <CircularProgressbar
                            value={progress}
                            text={`${progress}%`}
                            styles={buildStyles({
                                pathColor: "#016E5B",        // Green progress path
                                textColor: "#333",         // Text color
                                trailColor: "#e2e8f0",     // Light gray trail
                                strokeWidth: 10,           // Path thickness
                            })}
                        />
                    </div>
                </div>
            </div>
        </div>


    );
};

export default RoundProgressBar;
