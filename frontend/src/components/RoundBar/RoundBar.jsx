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


        <div className="card w-72 h-40 shadow-xl flex justify-center items-center cursor-pointer ">
            <div className="flex justify-center items-center flex-col">
                <div className="flex ">
                    <div className="flex flex-row items-center space-y-4">


                        <div >
                            <h4 className="text-2xl text-black">{title}</h4>
                            <p>{Module}</p>
                            <p>{duration}</p>
                            <p>{complete}</p>

                        </div>
                        {/* Circular progress bar */}
                        <div style={{ width: 80, height: 80 }}>
                            <CircularProgressbar
                                value={progress}
                                text={`${progress}%`}
                                styles={buildStyles({
                                    pathColor: "green", // Green color for the path
                                    textColor: "#333", // Text color
                                    trailColor: "#e2e8f0", // Light gray for the trail
                                    strokeWidth: 8, // Path thickness
                                })}
                            />
                        </div>

                    </div>
                </div>

            </div>

            {/* Input to change progress */}
            {/* <div className="flex space-x-2">
                <input
                    type="number"
                    value={progress}
                    onChange={handleInputChange}
                    className="p-2 border rounded-md"
                    placeholder="Enter Progress"
                />
            </div> */}
        </div >
    );
};

export default RoundProgressBar;
