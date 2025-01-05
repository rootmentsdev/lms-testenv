import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css"; // Import the styles

const RoundModule = ({ initialProgress, title, Module, duration, complete }) => {
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


        <div className="card w-96 h-40 border border-gray-300 shadow-md flex justify-center items-center cursor-pointer mt-10 ml-2 rounded-lg">
            <div className="flex justify-center items-center flex-col">
                <div className="flex">
                    <div className="flex flex-row mx-1 gap-10 items-center space-y-4">
                        <div className="m-3">
                            <h4 className="text-xl md:text2xl text-black font-semibold ">{title}</h4>
                            <p className="text-gray-600">{Module}</p>
                            <p className="text-gray-600">{duration}</p>
                            <p className="text-gray-600">{complete}</p>

                            {/* View Details Button */}
                            {/* <div className="flex w-32 border mt-4 border-[#016E5B] justify-evenly items-center py-1 rounded-lg cursor-pointer hover:bg-green-100 transition duration-200 ease-in-out">
                                <h4 className="text-black text-sm">View Details</h4>
                            </div> */}
                        </div>

                        {/* Circular progress bar */}
                        <div style={{ width: 80, height: 80 }}>
                            <CircularProgressbar
                                value={progress}
                                text={`${progress}%`}
                                styles={buildStyles({
                                    pathColor: "#016E5B",    // Green color for the path
                                    textColor: "#333",     // Text color
                                    trailColor: "#e2e8f0", // Light gray for the trail
                                    strokeWidth: 8,        // Path thickness
                                })}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>


    );
};

export default RoundModule;
