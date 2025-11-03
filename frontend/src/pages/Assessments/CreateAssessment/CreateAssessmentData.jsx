/**
 * Create Assessment Data Component
 * 
 * Creates new assessments with multiple questions and options
 * Supports adding questions, setting correct answers, and configuring assessment details
 * 
 * @returns {JSX.Element} - Create assessment data component
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
    CREATE_ASSESSMENT: 'api/assessments',
};

/**
 * Route paths
 */
const ROUTE_PATHS = {
    ASSESSMENTS: '/assessments',
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
 * Retrieves authentication token from localStorage safely
 * 
 * @returns {string|null} - Authentication token or null
 */
const getAuthToken = () => {
    try {
        return localStorage.getItem('token');
    } catch (error) {
        console.error('Failed to retrieve auth token:', error);
        return null;
    }
};

/**
 * Builds authorization headers for API requests
 * 
 * @returns {Object} - Headers object
 */
const buildAuthHeaders = () => {
    const token = getAuthToken();
    return {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
    };
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
 * Create Assessment Data Component
 */
const CreateAssessmentData = () => {
    const navigate = useNavigate();
    const [assessmentTitle, setAssessmentTitle] = useState("");
    const [duration, setDuration] = useState("");
    const [deadlineDays, setDeadlineDays] = useState("");
    const [questions, setQuestions] = useState([{ ...INITIAL_QUESTION }]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * Handles question text change
     * 
     * @param {number} qIndex - Question index
     * @param {string} value - New question text
     */
    const handleQuestionChange = useCallback((qIndex, value) => {
        setQuestions((prev) => {
            const updated = [...prev];
            updated[qIndex] = { ...updated[qIndex], questionText: value };
            return updated;
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
        setQuestions((prev) => {
            const updated = [...prev];
            updated[qIndex] = {
                ...updated[qIndex],
                options: updated[qIndex].options.map((opt, idx) => idx === oIndex ? value : opt),
            };
            return updated;
        });
    }, []);

    /**
     * Handles correct answer selection
     * 
     * @param {number} qIndex - Question index
     * @param {number} oIndex - Option index
     */
    const handleCorrectAnswerChange = useCallback((qIndex, oIndex) => {
        setQuestions((prev) => {
            const updated = [...prev];
            const selectedOption = updated[qIndex].options[oIndex];
            updated[qIndex] = { ...updated[qIndex], correctAnswer: selectedOption };
            return updated;
        });
    }, []);

    /**
     * Adds a new question
     */
    const addQuestion = useCallback(() => {
        setQuestions((prev) => [...prev, { ...INITIAL_QUESTION }]);
        toast.info('New question added');
    }, []);

    /**
     * Removes a question
     * 
     * @param {number} qIndex - Question index to remove
     */
    const removeQuestion = useCallback((qIndex) => {
        if (questions.length <= 1) {
            toast.warning('At least one question is required');
            return;
        }
        setQuestions((prev) => prev.filter((_, index) => index !== qIndex));
        toast.success('Question removed');
    }, [questions.length]);

    /**
     * Validates all questions
     * 
     * @returns {boolean} - True if all questions are valid
     */
    const validateQuestions = useCallback(() => {
        if (questions.length === 0) {
            toast.warning('Please add at least one question');
            return false;
        }

        const incompleteQuestions = questions.filter((q, index) => !isValidQuestion(q));
        if (incompleteQuestions.length > 0) {
            toast.warning('Please complete all questions before submitting');
            return false;
        }

        return true;
    }, [questions]);

    /**
     * Handles form submission
     */
    const handleSaveAssessment = useCallback(async () => {
        if (!assessmentTitle.trim()) {
            toast.error('Please enter an assessment title');
            return;
        }

        if (!duration || parseInt(duration) <= 0) {
            toast.error('Please enter a valid duration in minutes');
            return;
        }

        if (!deadlineDays || parseInt(deadlineDays) <= 0) {
            toast.error('Please enter a valid number of days to complete');
            return;
        }

        if (!validateQuestions()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const assessmentData = {
                title: assessmentTitle.trim(),
                duration: parseInt(duration),
                deadline: parseInt(deadlineDays),
                questions: questions.filter(isValidQuestion),
            };

            const response = await fetch(`${API_CONFIG.baseUrl}${API_ENDPOINTS.CREATE_ASSESSMENT}`, {
                method: "POST",
                headers: buildAuthHeaders(),
                credentials: "include",
                body: JSON.stringify(assessmentData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to create assessment');
            }

            toast.success(result.message || 'Assessment created successfully');
            
            // Reset form
            setAssessmentTitle("");
            setDuration("");
            setDeadlineDays("");
            setQuestions([{ ...INITIAL_QUESTION }]);
            
            // Navigate back after a short delay
            setTimeout(() => {
                navigate(ROUTE_PATHS.ASSESSMENTS);
            }, 1500);
        } catch (error) {
            console.error('Error creating assessment:', error);
            toast.error(error.message || 'Failed to create assessment');
        } finally {
            setIsSubmitting(false);
        }
    }, [assessmentTitle, duration, deadlineDays, questions, validateQuestions, navigate]);

    /**
     * Handles back navigation
     */
    const handleBack = useCallback(() => {
        navigate(ROUTE_PATHS.ASSESSMENTS);
    }, [navigate]);

    return (
        <div className="w-full mb-[70px] h-full bg-white text-black">
            <Header name="Create a new Assessments" />
            <SideNav />

            <div className="md:ml-[100px] mt-[150px]">
                {/* Back Button */}
                <Link to={ROUTE_PATHS.ASSESSMENTS}>
                    <div
                        className="flex items-center gap-1 m-5 text-black cursor-pointer hover:text-[#016E5B] transition-colors"
                        onClick={handleBack}
                    >
                        <IoIosArrowBack />
                        <p>Back</p>
                    </div>
                </Link>

                {/* Form Section */}
                <div className="mx-10 w-auto flex justify-between lg:flex-row flex-col gap-5 space-x-10">
                    {/* Assessment Details */}
                    <div className="flex flex-col space-y-6">
                        <div>
                            <p className="text-[#016E5B] font-semibold mb-2">Assessment Title *</p>
                            <input
                                type="text"
                                placeholder="Enter assessment title"
                                value={assessmentTitle}
                                onChange={(e) => setAssessmentTitle(e.target.value)}
                                className="bg-white lg:w-[450px] w-[300px] border p-2 rounded-lg focus:ring-2 focus:ring-[#016E5B] focus:border-[#016E5B]"
                                disabled={isSubmitting}
                                required
                            />
                        </div>

                        <div>
                            <p className="text-[#016E5B] font-semibold mb-2">Duration (minutes) *</p>
                            <input
                                type="number"
                                min="1"
                                placeholder="Enter duration in minutes"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="bg-white lg:w-[450px] w-[300px] border p-2 rounded-lg focus:ring-2 focus:ring-[#016E5B] focus:border-[#016E5B]"
                                disabled={isSubmitting}
                                required
                            />
                        </div>

                        <div>
                            <p className="text-[#016E5B] font-semibold mb-2">Days to Complete *</p>
                            <input
                                type="number"
                                min="1"
                                placeholder="How many days to complete"
                                value={deadlineDays}
                                onChange={(e) => setDeadlineDays(e.target.value)}
                                className="bg-white lg:w-[450px] w-[300px] border p-2 rounded-lg focus:ring-2 focus:ring-[#016E5B] focus:border-[#016E5B]"
                                disabled={isSubmitting}
                                required
                            />
                        </div>
                    </div>

                    {/* Questions Section */}
                    <div className="flex lg:mb-0 mb-5 lg:w-[450px] md:w-[400px] flex-col space-y-6">
                        <div className="flex justify-between items-center">
                            <p className="text-[#016E5B] font-semibold">Questions</p>
                            <button
                                type="button"
                                onClick={addQuestion}
                                className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm disabled:opacity-50"
                                disabled={isSubmitting}
                            >
                                Add Question
                            </button>
                        </div>

                        {questions.map((question, qIndex) => (
                            <div key={qIndex} className="space-y-4 p-4 border rounded-lg bg-gray-50">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">Question {qIndex + 1}</span>
                                    {questions.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeQuestion(qIndex)}
                                            className="text-red-500 hover:text-red-700 text-sm disabled:opacity-50"
                                            disabled={isSubmitting}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>

                                <input
                                    type="text"
                                    placeholder={`Question ${qIndex + 1} text`}
                                    value={question.questionText}
                                    onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                                    className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-[#016E5B] focus:border-[#016E5B]"
                                    disabled={isSubmitting}
                                />

                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-700">Options:</p>
                                    {question.options.map((option, oIndex) => (
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
                                                checked={question.correctAnswer === option && option.trim() !== ""}
                                                onChange={() => handleCorrectAnswerChange(qIndex, oIndex)}
                                                disabled={isSubmitting || option.trim() === ""}
                                                className="w-5 h-5 text-[#016E5B] cursor-pointer"
                                            />
                                            <span className="text-xs text-gray-500 w-16">Correct</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center mt-8">
                    <button
                        type="button"
                        onClick={handleSaveAssessment}
                        className="p-3 w-56 bg-[#016E5B] text-white rounded-lg hover:bg-[#014C3F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Creating...' : 'Submit Assessment'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateAssessmentData;
