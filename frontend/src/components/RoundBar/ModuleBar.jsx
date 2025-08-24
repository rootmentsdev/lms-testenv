// CSS imports must come first
import "react-circular-progressbar/dist/styles.css"; // Import the styles

const ModuleBar = ({ title, Module, duration, complete }) => {
    // Initialize the progress state


    // Handle the input change
    // const handleInputChange = (e) => {
    //     let value = parseInt(e.target.value, 10);
    //     // Ensure value is between 0 and 100
    //     if (value >= 0 && value <= 100) {
    //         setProgress(value);
    //     }
    // };

    return (


        <div className="card w-96 h-40 border border-gray-300 shadow-md flex justify-start  cursor-pointer mt-10 ml-2 rounded-lg">
            <div className="flex justify-start items-start flex-col">
                <div className="flex">
                    <div className="flex flex-row ml-10 items-center space-y-4">
                        <div>
                            <h4 className="text-2xl text-black font-semibold">{title}</h4>
                            <p className="text-gray-600">{Module}</p>
                            <p className="text-gray-600">{duration}</p>
                            <p className="text-gray-600">{complete}</p>

                            {/* View Details Button */}
                            <div className="flex w-32 border mt-4 border-[#016E5B] justify-evenly items-center py-1 rounded-lg cursor-pointer hover:bg-green-100 transition duration-200 ease-in-out">
                                <h4 className="text-black text-sm">View Details</h4>
                            </div>
                        </div>

                        {/* Circular progress bar */}

                    </div>
                </div>
            </div>
        </div>


    );
};

export default ModuleBar;
