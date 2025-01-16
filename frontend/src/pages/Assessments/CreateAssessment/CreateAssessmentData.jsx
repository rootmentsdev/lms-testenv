import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../components/Header/Header";
import { IoIosArrowBack } from "react-icons/io";
import baseUrl from "../../../api/api";
import { toast } from "react-toastify";
import SideNav from "../../../components/SideNav/SideNav";

const CreateAssessmentData = () => {
    const [moduleTitle, setModuleTitle] = useState("");
    const [moduleDescription, setModuleDescription] = useState("");
    const [moduleDescriptions, setModuleDescriptions] = useState("");
    const token = localStorage.getItem('token');
    const [questions, setQuestions] = useState([
        { questionText: "", options: ["", "", "", ""], correctAnswer: "" },
    ]);

    // Handle Question Input Changes
    const handleQuestionChange = (qIndex, field, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[qIndex][field] = value;
        setQuestions(updatedQuestions);
    };

    // Handle Options
    const handleOptionChange = (qIndex, oIndex, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[qIndex].options[oIndex] = value;
        setQuestions(updatedQuestions);
    };

    // Handle Correct Answer Selection
    const handleCorrectAnswerChange = (qIndex, oIndex) => {
        const updatedQuestions = [...questions];
        updatedQuestions[qIndex].correctAnswer = updatedQuestions[qIndex].options[oIndex];
        setQuestions(updatedQuestions);
    };

    // Add New Question
    const addQuestion = () => {
        const updatedQuestions = [
            ...questions,
            { questionText: "", options: ["", "", "", ""], correctAnswer: "" },
        ];
        setQuestions(updatedQuestions);
    };

    // Submit Module
    const handleSaveModule = async () => {
        if (questions.some(q => !q.questionText || !q.correctAnswer)) {
            toast.warning("Please complete all questions.");
            return;
        }

        const assessmentData = {
            title: moduleTitle,
            duration: moduleDescription,
            deadline: moduleDescriptions,
            questions,
        };

        console.log(assessmentData);

        try {
            const response = await fetch(`${baseUrl.baseUrl}api/assessments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`,
                },
                credentials: "include",
                body: JSON.stringify(assessmentData),
            });

            const data = await response.json();
            toast.success(data.message);
        } catch (error) {
            throw new Error(error);
        }
    };

    return (
        <div className="w-full mb-[70px] h-full bg-white text-black">
            <Header name="Create a new Assessments" />
            <SideNav />
            <div className="md:ml-[100px] mt-[150px]">
                <div>
                    <Link to={"/assessments"}>
                        <div className="flex items-center gap-1 m-5 text-black cursor-pointer">
                            <IoIosArrowBack />
                            <p>Back</p>
                        </div>
                    </Link>
                </div>

                <div className="mx-10 w-auto flex justify-between lg:flex-row  flex-col gap-5 space-x-10">
                    <div className="flex flex-col space-y-6">
                        <div>
                            <p className="text-[#016E5B] font-semibold mb-2">Assessment Title</p>
                            <input
                                placeholder="Enter module title"
                                type="text"
                                className="bg-white lg:w-[450px] w-[300px] border p-2 rounded-lg"
                                value={moduleTitle}
                                onChange={(e) => setModuleTitle(e.target.value)}
                            />
                        </div>

                        <div>
                            <p className="text-[#016E5B] font-semibold mb-2">Duration</p>
                            <input
                                placeholder="Add duration in minutes "
                                type="number"
                                className=" bg-white lg:w-[450px] w-[300px] border p-2 rounded-lg"
                                value={moduleDescription}
                                onChange={(e) => setModuleDescription(e.target.value)}
                            />
                        </div>
                        <div>
                            <p className="text-[#016E5B] font-semibold mb-2">No: of days to complete</p>
                            <input
                                placeholder="How many days take to complete the work"
                                type="number"
                                className=" bg-white lg:w-[450px] w-[300px] border p-2 rounded-lg"
                                value={moduleDescriptions}
                                onChange={(e) => setModuleDescriptions(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex lg:mb-0 mb-5 lg:w-[450px]  md:w-[400px]  flex-col space-y-6">
                        {questions.map((q, qIndex) => (
                            <div key={qIndex} className="space-y-4 p-4 border rounded-lg">
                                <input
                                    type="text"
                                    placeholder={`Question ${qIndex + 1}`}
                                    value={q.questionText}
                                    onChange={(e) => handleQuestionChange(qIndex, "questionText", e.target.value)}
                                    className="w-full p-2 border rounded-lg bg-white"
                                />

                                {q.options.map((option, oIndex) => (
                                    <div key={oIndex} className="flex items-center space-x-3">
                                        <input
                                            type="text"
                                            placeholder={`Option ${oIndex + 1}`}
                                            value={option}
                                            onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                            className="w-full p-2 border bg-white rounded-lg"
                                        />
                                        <input
                                            type="radio"
                                            name={`correctOption-${qIndex}`}
                                            checked={q.correctAnswer === option}
                                            onChange={() => handleCorrectAnswerChange(qIndex, oIndex)}
                                            className="w-5 h-5"
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

                <div className="flex justify-center">
                    <button onClick={handleSaveModule} className="p-3 w-56 bg-[#016E5B] text-white rounded-lg">
                        Submit Module
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateAssessmentData;
