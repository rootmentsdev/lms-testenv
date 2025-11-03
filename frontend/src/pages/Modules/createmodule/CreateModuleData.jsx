/**
 * Create Module Data Component
 * 
 * Creates new training modules with multiple videos and questions
 * Supports adding videos, managing questions for each video, and validation
 * 
 * @returns {JSX.Element} - Create module data component
 */
import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { toast } from "react-toastify";

import Header from "../../../components/Header/Header";
import SideNav from "../../../components/SideNav/SideNav";
import API_CONFIG from "../../../api/api";

/**
 * API endpoints
 */
const API_ENDPOINTS = {
    CREATE_MODULE: 'api/modules',
};

/**
 * Route paths
 */
const ROUTE_PATHS = {
    MODULES: '/modules',
};

/**
 * Initial question structure
 */
const INITIAL_QUESTION = {
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: "",
};

/**
 * Initial video structure
 */
const INITIAL_VIDEO = {
    title: "",
    videoUri: "",
    questions: [{ ...INITIAL_QUESTION }],
};

/**
 * Validates if a question is complete
 * 
 * @param {Object} question - Question object
 * @returns {boolean} - True if question is valid
 */
const isValidQuestion = (question) => {
    return question.questionText &&
        question.questionText.trim() !== "" &&
        question.options &&
        question.options.length >= 2 &&
        question.options.some(option => option.trim() !== "") &&
        question.correctAnswer &&
        question.correctAnswer.trim() !== "";
};

/**
 * Validates if current video is ready to be saved
 * 
 * @param {Object} video - Video object
 * @returns {boolean} - True if video is valid
 */
const isValidVideo = (video) => {
    if (!video.title || !video.title.trim()) return false;
    if (!video.videoUri || !video.videoUri.trim()) return false;
    if (!video.questions || video.questions.length === 0) return false;
    return video.questions.some(isValidQuestion);
};

/**
 * Create Module Data Component
 */
const CreateModuleData = () => {
    const navigate = useNavigate();
    const [moduleTitle, setModuleTitle] = useState("");
    const [moduleDescription, setModuleDescription] = useState("");
    const [videos, setVideos] = useState([]);
    const [currentVideo, setCurrentVideo] = useState({ ...INITIAL_VIDEO });
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * Handles video field changes
     * 
     * @param {string} field - Field name
     * @param {string} value - Field value
     */
    const handleVideoChange = useCallback((field, value) => {
        setCurrentVideo((prev) => ({ ...prev, [field]: value }));
    }, []);

    /**
     * Handles question text change
     * 
     * @param {number} qIndex - Question index
     * @param {string} value - New question text
     */
    const handleQuestionChange = useCallback((qIndex, value) => {
        setCurrentVideo((prev) => {
            const updatedQuestions = [...prev.questions];
            updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], questionText: value };
            return { ...prev, questions: updatedQuestions };
        });
    }, []);

    /**
     * Handles option change
     * 
     * @param {number} qIndex - Question index
     * @param {number} oIndex - Option index
     * @param {string} value - New option value
     */
    const handleOptionChange = useCallback((qIndex, oIndex, value) => {
        setCurrentVideo((prev) => {
            const updatedQuestions = [...prev.questions];
            updatedQuestions[qIndex] = {
                ...updatedQuestions[qIndex],
                options: updatedQuestions[qIndex].options.map((opt, idx) => idx === oIndex ? value : opt),
            };
            return { ...prev, questions: updatedQuestions };
        });
    }, []);

    /**
     * Handles correct answer selection
     * 
     * @param {number} qIndex - Question index
     * @param {number} oIndex - Option index
     */
    const handleCorrectAnswerChange = useCallback((qIndex, oIndex) => {
        setCurrentVideo((prev) => {
            const updatedQuestions = [...prev.questions];
            const selectedOption = updatedQuestions[qIndex].options[oIndex];
            updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], correctAnswer: selectedOption };
            return { ...prev, questions: updatedQuestions };
        });
    }, []);

    /**
     * Adds a new question to current video
     */
    const addQuestion = useCallback(() => {
        setCurrentVideo((prev) => ({
            ...prev,
            questions: [...prev.questions, { ...INITIAL_QUESTION }],
        }));
    }, []);

    /**
     * Removes a question from current video
     * 
     * @param {number} qIndex - Question index to remove
     */
    const removeQuestion = useCallback((qIndex) => {
        if (currentVideo.questions.length <= 1) {
            toast.warning("At least one question is required for each video.");
            return;
        }

        setCurrentVideo((prev) => ({
            ...prev,
            questions: prev.questions.filter((_, index) => index !== qIndex),
        }));
        toast.success("Question removed successfully!");
    }, [currentVideo.questions.length]);

    /**
     * Saves current video to videos array
     */
    const saveCurrentVideo = useCallback(() => {
        if (!currentVideo.title || !currentVideo.title.trim()) {
            toast.error("Please enter a video title.");
            return;
        }

        if (!currentVideo.videoUri || !currentVideo.videoUri.trim()) {
            toast.error("Please enter a video URL.");
            return;
        }

        if (!isValidVideo(currentVideo)) {
            toast.error("⚠️ Please add at least one complete question. Each question must have text, at least 2 options, and a correct answer selected.");
            return;
        }

        const videoToSave = {
            ...currentVideo,
            title: currentVideo.title.trim(),
            videoUri: currentVideo.videoUri.trim(),
            questions: currentVideo.questions || [],
        };

        setVideos((prev) => [...prev, videoToSave]);
        setCurrentVideo({ ...INITIAL_VIDEO });
        toast.success("Video saved successfully!");
    }, [currentVideo]);

    /**
     * Clears all form data
     */
    const clearForm = useCallback(() => {
        setModuleTitle("");
        setModuleDescription("");
        setVideos([]);
        setCurrentVideo({ ...INITIAL_VIDEO });
    }, []);

    /**
     * Validates all videos before submission
     * 
     * @returns {boolean} - True if all videos are valid
     */
    const validateAllVideos = useCallback(() => {
        if (videos.length === 0) {
            toast.warning("Please add at least one video.");
            return false;
        }

        for (let i = 0; i < videos.length; i++) {
            const video = videos[i];
            if (!isValidVideo(video)) {
                toast.error(`Video "${video.title || i + 1}" has incomplete questions. Please ensure each video has at least one complete question.`);
                return false;
            }
        }

        return true;
    }, [videos]);

    /**
     * Handles module submission
     */
    const handleSaveModule = useCallback(async () => {
        if (!moduleTitle.trim()) {
            toast.error("Please enter a module title.");
            return;
        }

        if (!moduleDescription.trim()) {
            toast.error("Please enter a module description.");
            return;
        }

        if (!validateAllVideos()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const newModule = {
                moduleName: moduleTitle.trim(),
                description: moduleDescription.trim(),
                videos: videos.map(video => ({
                    ...video,
                    title: video.title.trim(),
                    videoUri: video.videoUri.trim(),
                    questions: video.questions || [],
                })),
            };

            const response = await fetch(`${API_CONFIG.baseUrl}${API_ENDPOINTS.CREATE_MODULE}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(newModule),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            toast.success(data.message || "Module created successfully!");

            clearForm();
            
            setTimeout(() => {
                navigate(ROUTE_PATHS.MODULES);
            }, 1500);
        } catch (error) {
            console.error('Error creating module:', error);
            toast.error(error.message || "Failed to create module.");
        } finally {
            setIsSubmitting(false);
        }
    }, [moduleTitle, moduleDescription, videos, validateAllVideos, clearForm, navigate]);

    /**
     * Handles back navigation
     */
    const handleBack = useCallback(() => {
        navigate(ROUTE_PATHS.MODULES);
    }, [navigate]);

    const isVideoReady = isValidVideo(currentVideo);

    return (
        <div className="w-full h-full bg-white text-black">
            <Header name="Modules" />
            <SideNav />

            <div className="md:ml-[100px] mt-[100px] mx-auto max-w-[1400px] w-full mb-[70px]">
                {/* Back Button */}
                <Link to={ROUTE_PATHS.MODULES}>
                    <div
                        className="flex items-center gap-1 m-5 text-black cursor-pointer hover:text-[#016E5B] transition-colors"
                        onClick={handleBack}
                    >
                        <IoIosArrowBack />
                        <p>Back</p>
                    </div>
                </Link>

                {/* Form Section */}
                <div className="mx-10 w-auto flex justify-between space-x-10 flex-wrap gap-10">
                    {/* Module Details */}
                    <div className="flex flex-col space-y-6">
                        <div>
                            <label htmlFor="moduleTitle" className="text-[#016E5B] font-semibold mb-2 block">
                                Module Title *
                            </label>
                            <input
                                id="moduleTitle"
                                type="text"
                                placeholder="Enter module title"
                                className="bg-white w-[450px] border p-2 rounded-lg focus:ring-2 focus:ring-[#016E5B] focus:border-[#016E5B]"
                                value={moduleTitle}
                                onChange={(e) => setModuleTitle(e.target.value)}
                                disabled={isSubmitting}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="moduleDescription" className="text-[#016E5B] font-semibold mb-2 block">
                                Description *
                            </label>
                            <textarea
                                id="moduleDescription"
                                placeholder="Add a description..."
                                className="w-[450px] h-[250px] border bg-white p-4 rounded-lg focus:ring-2 focus:ring-[#016E5B] focus:border-[#016E5B]"
                                value={moduleDescription}
                                onChange={(e) => setModuleDescription(e.target.value)}
                                disabled={isSubmitting}
                                required
                            />
                        </div>
                    </div>

                    {/* Video and Questions Section */}
                    <div className="flex flex-col space-y-6">
                        <div>
                            <label htmlFor="videoTitle" className="text-[#016E5B] font-semibold mb-2 block">
                                Video Title *
                            </label>
                            <input
                                id="videoTitle"
                                type="text"
                                placeholder="Video Title"
                                value={currentVideo.title}
                                onChange={(e) => handleVideoChange("title", e.target.value)}
                                className="bg-white w-[450px] border p-2 rounded-lg focus:ring-2 focus:ring-[#016E5B] focus:border-[#016E5B]"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <label htmlFor="videoUri" className="text-[#016E5B] font-semibold mb-2 block">
                                Video URL *
                            </label>
                            <input
                                id="videoUri"
                                type="text"
                                placeholder="Video URL"
                                value={currentVideo.videoUri}
                                onChange={(e) => handleVideoChange("videoUri", e.target.value)}
                                className="bg-white w-[450px] border p-2 rounded-lg focus:ring-2 focus:ring-[#016E5B] focus:border-[#016E5B]"
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Questions */}
                        {currentVideo.questions.map((q, qIndex) => {
                            const isComplete = isValidQuestion(q);

                            return (
                                <div
                                    key={qIndex}
                                    className={`space-y-4 p-4 border rounded-lg ${
                                        isComplete ? 'border-green-300 bg-green-50' : 'border-orange-300 bg-orange-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            placeholder={`Question ${qIndex + 1}`}
                                            value={q.questionText}
                                            onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                                            className="flex-1 p-2 border rounded-lg bg-white focus:ring-2 focus:ring-[#016E5B] focus:border-[#016E5B]"
                                            disabled={isSubmitting}
                                        />
                                        {isComplete ? (
                                            <span className="text-green-600 text-lg" title="Question is complete">✅</span>
                                        ) : (
                                            <span className="text-orange-600 text-lg" title="Question is incomplete">⚠️</span>
                                        )}
                                        {currentVideo.questions.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeQuestion(qIndex)}
                                                className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm disabled:opacity-50"
                                                disabled={isSubmitting}
                                                title="Remove this question"
                                            >
                                                🗑️ Remove
                                            </button>
                                        )}
                                    </div>

                                    {/* Options */}
                                    {q.options.map((option, oIndex) => (
                                        <div key={oIndex} className="flex items-center space-x-3">
                                            <input
                                                type="text"
                                                placeholder={`Option ${oIndex + 1}`}
                                                value={option}
                                                onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                className="flex-1 p-2 border bg-white rounded-lg focus:ring-2 focus:ring-[#016E5B] focus:border-[#016E5B]"
                                                disabled={isSubmitting}
                                            />
                                            <input
                                                type="radio"
                                                name={`correctOption-${qIndex}`}
                                                checked={q.correctAnswer === option && option.trim() !== ""}
                                                onChange={() => handleCorrectAnswerChange(qIndex, oIndex)}
                                                disabled={isSubmitting || option.trim() === ""}
                                                className="w-5 h-5 text-[#016E5B] cursor-pointer"
                                            />
                                            <span className="text-xs text-gray-500 w-16">Correct</span>
                                        </div>
                                    ))}

                                    {/* Add Question Button */}
                                    <div className="flex justify-center pt-2">
                                        <button
                                            type="button"
                                            onClick={addQuestion}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                                            disabled={isSubmitting}
                                        >
                                            ➕ Add Question
                                        </button>
                                    </div>

                                    {/* Question Count */}
                                    <div className="text-center text-sm text-gray-600 mt-2">
                                        {currentVideo.questions.length} question{currentVideo.questions.length !== 1 ? 's' : ''} added
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Validation Status */}
                <div className="float-right mt-2 mb-2">
                    {isVideoReady ? (
                        <div className="flex items-center gap-2 text-green-600">
                            <span className="text-lg">✅</span>
                            <span className="text-sm font-medium">Video ready to save</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-orange-600">
                            <span className="text-lg">⚠️</span>
                            <span className="text-sm font-medium">Complete video details and add at least one question</span>
                        </div>
                    )}
                </div>

                {/* Save Video Button */}
                <button
                    type="button"
                    onClick={saveCurrentVideo}
                    className={`p-3 w-56 rounded-lg float-right mt-5 mb-32 ${
                        isVideoReady
                            ? 'bg-[#016E5B] text-white hover:bg-[#014d42]'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    } transition-colors disabled:opacity-50`}
                    disabled={!isVideoReady || isSubmitting}
                >
                    Save video and questions
                </button>

                {/* Saved Videos Count */}
                {videos.length > 0 && (
                    <div className="text-center mt-4 mb-4">
                        <p className="text-green-600 font-semibold">
                            ✅ {videos.length} video{videos.length !== 1 ? 's' : ''} saved
                        </p>
                    </div>
                )}

                {/* Submit Module Button */}
                <div className="flex justify-center clear-both">
                    <button
                        type="button"
                        onClick={handleSaveModule}
                        className={`p-3 w-56 rounded-lg ${
                            videos.length > 0
                                ? 'bg-[#016E5B] text-white hover:bg-[#014C3F]'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        } transition-colors disabled:opacity-50`}
                        disabled={!videos.length || isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Module'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateModuleData;
