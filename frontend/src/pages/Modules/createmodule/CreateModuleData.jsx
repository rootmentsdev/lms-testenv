import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../components/Header/Header";
import { IoIosArrowBack } from "react-icons/io";
import baseUrl from "../../../api/api";

const CreateModuleData = () => {
    const [moduleTitle, setModuleTitle] = useState("");
    const [moduleDescription, setModuleDescription] = useState("");
    const [videos, setVideos] = useState([
        {
            title: "",
            videoUri: "",
            questions: [{ questionText: "", options: ["", "", "", ""], correctAnswer: "" }],
        },
    ]);

    // Handle Video Input Changes
    const handleVideoChange = (index, field, value) => {
        const updatedVideos = [...videos];
        updatedVideos[index][field] = value;
        setVideos(updatedVideos);
    };

    // Handle Question Input Changes
    const handleQuestionChange = (vIndex, qIndex, field, value) => {
        const updatedVideos = [...videos];
        updatedVideos[vIndex].questions[qIndex][field] = value;
        setVideos(updatedVideos);
    };

    // Handle Options
    const handleOptionChange = (vIndex, qIndex, oIndex, value) => {
        const updatedVideos = [...videos];
        updatedVideos[vIndex].questions[qIndex].options[oIndex] = value;
        setVideos(updatedVideos);
    };

    // Handle Correct Answer Selection
    const handleCorrectAnswerChange = (vIndex, qIndex, oIndex) => {
        const updatedVideos = [...videos];
        updatedVideos[vIndex].questions[qIndex].correctAnswer =
            updatedVideos[vIndex].questions[qIndex].options[oIndex];
        setVideos(updatedVideos);
    };

    // Add New Question
    const addQuestion = (vIndex) => {
        const updatedVideos = [...videos];
        updatedVideos[vIndex].questions.push({
            questionText: "",
            options: ["", "", "", ""],
            correctAnswer: "",
        });
        setVideos(updatedVideos);
    };


    const handleSaveModule = async () => {
        const newModule = {
            moduleName: moduleTitle,
            description: moduleDescription,
            videos,
        };

        try {
            const response = await fetch(`${baseUrl.baseUrl}api/modules`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(newModule),
            });

            const data = await response.json();
            alert(data.message);
        } catch (error) {
            throw new Error(error)
        }
    };

    return (
        <div className="w-full h-full bg-white">
            {/* Header */}
            <Header name="New Module" />

            {/* Back Button */}
            <div>
                <Link to={""}>
                    <div className="flex items-center gap-1 m-5 text-black cursor-pointer">
                        <IoIosArrowBack />
                        <p>Back</p>
                    </div>
                </Link>
            </div>

            {/* Module Inputs */}
            <div className="mx-10 w-auto flex justify-between space-x-10">
                <div className="flex flex-col space-y-6">
                    <div>
                        <p className="text-green-500 font-semibold mb-2">Module Title</p>
                        <input
                            placeholder="Enter module title"
                            type="text"
                            className="bg-white w-[450px] border p-2 rounded-lg"
                            value={moduleTitle}
                            onChange={(e) => setModuleTitle(e.target.value)}
                        />
                    </div>

                    <div>
                        <p className="text-green-500 font-semibold mb-2">Description</p>
                        <textarea
                            placeholder="Add a description..."
                            className="w-[450px] h-[250px] border bg-white  p-4 rounded-lg"
                            value={moduleDescription}
                            onChange={(e) => setModuleDescription(e.target.value)}
                        />
                    </div>
                </div>

                {/* Videos Section */}
                <div className="flex flex-col space-y-6">
                    {videos.map((video, vIndex) => (
                        <div key={vIndex} className="space-y-6">
                            <div>
                                <p className="text-green-500 font-semibold mb-2">Video Title</p>
                                <input
                                    type="text"
                                    placeholder="Video Title"
                                    value={video.title}
                                    onChange={(e) => handleVideoChange(vIndex, "title", e.target.value)}
                                    className="bg-white w-[450px] border p-2 rounded-lg"
                                />
                            </div>

                            <div>
                                <p className="text-green-500 font-semibold mb-2">Video URL</p>
                                <input
                                    type="text"
                                    placeholder="Video URL"
                                    value={video.videoUri}
                                    onChange={(e) =>
                                        handleVideoChange(vIndex, "videoUri", e.target.value)
                                    }
                                    className="bg-white w-[450px] border p-2 rounded-lg"
                                />
                            </div>

                            {/* Questions */}
                            {video.questions.map((q, qIndex) => (
                                <div key={qIndex} className="space-y-4 p-4 border rounded-lg">
                                    <input
                                        type="text"
                                        placeholder={`Question ${qIndex + 1}`}
                                        value={q.questionText}
                                        onChange={(e) =>
                                            handleQuestionChange(vIndex, qIndex, "questionText", e.target.value)
                                        }
                                        className="w-full p-2 border rounded-lg bg-white "
                                    />

                                    {q.options.map((option, oIndex) => (
                                        <div key={oIndex} className="flex items-center space-x-3">
                                            <input
                                                type="text"
                                                placeholder={`Option ${oIndex + 1}`}
                                                value={option}
                                                onChange={(e) =>
                                                    handleOptionChange(vIndex, qIndex, oIndex, e.target.value)
                                                }
                                                className="w-full p-2 border bg-white  rounded-lg"
                                            />
                                            <input
                                                type="radio"
                                                name={`correctOption-${vIndex}-${qIndex}`}
                                                checked={q.correctAnswer === option}
                                                onChange={() =>
                                                    handleCorrectAnswerChange(vIndex, qIndex, oIndex)
                                                }
                                                className="w-5 h-5 "
                                            />
                                        </div>
                                    ))}
                                    <button onClick={() => addQuestion(vIndex)} className="p-2 bg-blue-500 text-white rounded-lg">
                                        Add Question
                                    </button>
                                </div>
                            ))}
                        </div>
                    ))}


                </div>
            </div>

            <div className="flex justify-center">
                <button onClick={handleSaveModule} className="p-3 w-56 bg-green-500 text-white rounded-lg">
                    Save Module
                </button>
            </div>
        </div>
    );
};

export default CreateModuleData;
