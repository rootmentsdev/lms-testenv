import React, { useState } from 'react';
import { FaTimes, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

const AssessmentModal = ({ questions = [], onComplete, onClose }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const handleAnswerSelect = (questionId, selectedAnswer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: selectedAnswer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < totalQuestions) {
      alert('Please answer all questions before submitting.');
      return;
    }

    // Calculate score
    let correctAnswers = 0;
    questions.forEach(question => {
      if (answers[question._id] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const finalScore = Math.round((correctAnswers / totalQuestions) * 100);
    setScore(finalScore);
    setSubmitted(true);
    setShowResults(true);
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete(answers);
    }
    onClose();
  };

  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / totalQuestions) * 100;
  };

  const getQuestionStatus = (index) => {
    if (index < currentQuestionIndex) return 'answered';
    if (index === currentQuestionIndex) return 'current';
    return 'unanswered';
  };

  if (showResults) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="text-center">
            {score >= 70 ? (
              <div className="text-green-600 mb-4">
                <FaCheck className="mx-auto h-16 w-16 mb-4" />
                <h3 className="text-xl font-semibold">Congratulations!</h3>
                <p className="text-gray-600">You passed the assessment</p>
              </div>
            ) : (
              <div className="text-red-600 mb-4">
                <FaExclamationTriangle className="mx-auto h-16 w-16 mb-4" />
                <h3 className="text-xl font-semibold">Assessment Failed</h3>
                <p className="text-gray-600">You need to score 70% or higher to pass</p>
              </div>
            )}

            <div className="mb-6">
              <div className="text-3xl font-bold text-gray-900 mb-2">{score}%</div>
              <div className="text-sm text-gray-600">
                {score >= 70 ? 'Passed' : 'Failed'} - {Object.keys(answers).length} of {totalQuestions} questions answered
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleComplete}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {score >= 70 ? 'Continue to Next Module' : 'Retry Assessment'}
              </button>
              
              {score < 70 && (
                <button
                  onClick={() => {
                    setShowResults(false);
                    setCurrentQuestionIndex(0);
                    setAnswers({});
                    setSubmitted(false);
                  }}
                  className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Review Questions
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Module Assessment</h2>
            <p className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium text-blue-600">
              {Math.round(getProgressPercentage())}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>

        {/* Question Navigation */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex space-x-2 overflow-x-auto">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`flex-shrink-0 w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  getQuestionStatus(index) === 'current'
                    ? 'bg-blue-600 text-white'
                    : getQuestionStatus(index) === 'answered'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Question Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {currentQuestion && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                {currentQuestion.questionText}
              </h3>

              <div className="space-y-3">
                {currentQuestion.options.map((option, optionIndex) => (
                  <label
                    key={optionIndex}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      answers[currentQuestion._id] === option
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion._id}`}
                      value={option}
                      checked={answers[currentQuestion._id] === option}
                      onChange={() => handleAnswerSelect(currentQuestion._id, option)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 border-2 rounded-full mr-3 flex items-center justify-center ${
                      answers[currentQuestion._id] === option
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {answers[currentQuestion._id] === option && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="text-gray-900">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentQuestionIndex === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Previous
          </button>

          <div className="flex space-x-3">
            {!isLastQuestion ? (
              <button
                onClick={handleNext}
                disabled={!answers[currentQuestion?._id]}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  !answers[currentQuestion?._id]
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length < totalQuestions}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  Object.keys(answers).length < totalQuestions
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                Submit Assessment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentModal;
