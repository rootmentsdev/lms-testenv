import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../components/Header/Header";
import { IoIosArrowBack } from "react-icons/io";
import baseUrl from "../../../api/api";

const CreateModuleData = () => {
    const [moduleTitle, setModuleTitle] = useState("");
    const [moduleDescription, setModuleDescription] = useState("");
    const [videos, setVideos] = useState(null);
    const [currentVideo, setCurrentVideo] = useState({
        title: "",
        videoUri: "",
        questions: [{ questionText: "", options: ["", "", "", ""], correctAnswer: "" }],
    });

    // Handle Video Input Changes
    const handleVideoChange = (field, value) => {
        setCurrentVideo({ ...currentVideo, [field]: value });
    };

    // Handle Question Input Changes
    const handleQuestionChange = (qIndex, field, value) => {
        const updatedQuestions = [...currentVideo.questions];
        updatedQuestions[qIndex][field] = value;
        setCurrentVideo({ ...currentVideo, questions: updatedQuestions });
    };

    // Handle Options
    const handleOptionChange = (qIndex, oIndex, value) => {
        const updatedQuestions = [...currentVideo.questions];
        updatedQuestions[qIndex].options[oIndex] = value;
        setCurrentVideo({ ...currentVideo, questions: updatedQuestions });
    };

    // Handle Correct Answer Selection
    const handleCorrectAnswerChange = (qIndex, oIndex) => {
        const updatedQuestions = [...currentVideo.questions];
        updatedQuestions[qIndex].correctAnswer = updatedQuestions[qIndex].options[oIndex];
        setCurrentVideo({ ...currentVideo, questions: updatedQuestions });
    };

    // Add New Question
    const addQuestion = () => {
        const updatedQuestions = [...currentVideo.questions, { questionText: "", options: ["", "", "", ""], correctAnswer: "" }];
        setCurrentVideo({ ...currentVideo, questions: updatedQuestions });
    };

    // Save Video and Questions
    const saveCurrentVideo = () => {
        const updatedVideos = videos ? [...videos] : [];
        updatedVideos.push(currentVideo);
        setVideos(updatedVideos);

        setCurrentVideo({
            title: "",
            videoUri: "",
            questions: [{ questionText: "", options: ["", "", "", ""], correctAnswer: "" }],
        });
    };

    // Submit Module
    const handleSaveModule = async () => {
        if (!videos || videos.length === 0) {
            alert("Please add at least one video.");
            return;
        }

        const newModule = {
            moduleName: moduleTitle,
            description: moduleDescription,
            videos,
        };
        console.log(newModule);

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
            throw new Error(error);
        }
    };

    return (
        <div className="w-full h-full bg-white text-black">
            <Header name="New Module" />

            <div>
                <Link to={""}>
                    <div className="flex items-center gap-1 m-5 text-black cursor-pointer">
                        <IoIosArrowBack />
                        <p>Back</p>
                    </div>
                </Link>
            </div>

            <div className="mx-10 w-auto flex justify-between space-x-10">
                <div className="flex flex-col space-y-6">
                    <div>
                        <p className="text-[#016E5B] font-semibold mb-2">Module Title</p>
                        <input
                            placeholder="Enter module title"
                            type="text"
                            className="bg-white w-[450px] border p-2 rounded-lg"
                            value={moduleTitle}
                            onChange={(e) => setModuleTitle(e.target.value)}
                        />
                    </div>

                    <div>
                        <p className="text-[#016E5B] font-semibold mb-2">Description</p>
                        <textarea
                            placeholder="Add a description..."
                            className="w-[450px] h-[250px] border bg-white  p-4 rounded-lg"
                            value={moduleDescription}
                            onChange={(e) => setModuleDescription(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-col space-y-6">
                    <div>
                        <p className="text-[#016E5B] font-semibold mb-2">Video Title</p>
                        <input
                            type="text"
                            placeholder="Video Title"
                            value={currentVideo.title}
                            onChange={(e) => handleVideoChange("title", e.target.value)}
                            className="bg-white w-[450px] border p-2 rounded-lg"
                        />
                    </div>

                    <div>
                        <p className="text-[#016E5B] font-semibold mb-2">Video URL</p>
                        <input
                            type="text"
                            placeholder="Video URL"
                            value={currentVideo.videoUri}
                            onChange={(e) => handleVideoChange("videoUri", e.target.value)}
                            className="bg-white w-[450px] border p-2 rounded-lg"
                        />
                    </div>

                    {currentVideo.questions.map((q, qIndex) => (
                        <div key={qIndex} className="space-y-4 p-4 border rounded-lg">
                            <input
                                type="text"
                                placeholder={`Question ${qIndex + 1}`}
                                value={q.questionText}
                                onChange={(e) => handleQuestionChange(qIndex, "questionText", e.target.value)}
                                className="w-full p-2 border rounded-lg bg-white "
                            />

                            {q.options.map((option, oIndex) => (
                                <div key={oIndex} className="flex items-center space-x-3">
                                    <input
                                        type="text"
                                        placeholder={`Option ${oIndex + 1}`}
                                        value={option}
                                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                        className="w-full p-2 border bg-white  rounded-lg"
                                    />
                                    <input
                                        type="radio"
                                        name={`correctOption-${qIndex}`}
                                        checked={q.correctAnswer === option}
                                        onChange={() => handleCorrectAnswerChange(qIndex, oIndex)}
                                        className="w-5 h-5 "
                                    />
                                </div>
                            ))}
                            <button onClick={addQuestion} className="p-2 bg-blue-500 text-white rounded-lg">
                                Add Question
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <button onClick={saveCurrentVideo} className="p-3 w-56 bg-[#016E5B] text-white rounded-lg float-right mt-5 mb-32">
                Save video and questions
            </button>

            <div className="flex justify-center">
                <button onClick={handleSaveModule} className="p-3 w-56 bg-[#016E5B] text-white rounded-lg">
                    Submit Module
                </button>
            </div>
        </div>
    );
};

export default CreateModuleData;
