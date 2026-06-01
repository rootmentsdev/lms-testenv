import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import baseUrl from "../../../api/api";
import { toast } from "react-toastify";
import SideNav from "../../../components/SideNav/SideNav";
import {
  FaPlus,
  FaRegCircle,
  FaCircle,
  FaChevronLeft,
  FaChevronRight,
  FaRegBookmark,
  FaRegFileLines,
  FaTrash,
} from "react-icons/fa6";

/* ─── helpers ─────────────────────────────────────────────── */
const emptyQuestion = () => ({
  questionText: "",
  options: ["", "", "", ""],
  correctAnswer: "",
});

const emptyVideo = () => ({
  title: "",
  videoUri: "",
  questions: [emptyQuestion()],
});

const getCurrentAdminName = () => {
  const token = localStorage.getItem("token");
  if (!token) return "Super Admin";

  try {
    const payload = JSON.parse(atob(token.split(".")[1] || ""));
    return payload?.username || payload?.name || "Super Admin";
  } catch {
    return "Super Admin";
  }
};

/* ─── SavedVideoCard ──────────────────────────────────────── */
const SavedVideoCard = ({ video, active, onRemove }) => {
  const firstQuestion = video.questions?.[0];
  const options = firstQuestion?.options?.length
    ? firstQuestion.options
    : ["Option 1", "Option 2", "Option 3", "Option 4"];

  return (
    <div
      className={`rounded-[7px] border bg-white p-3 ${
        active ? "border-[#212121] ring-1 ring-[#212121]" : "border-gray-300"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-[13px] font-semibold text-gray-900 truncate">
          {video.title || "Video Title"}
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 text-gray-400 hover:text-red-500 transition-colors"
            title="Remove video"
          >
            <FaTrash size={10} />
          </button>
        )}
      </div>
      <div className="mt-1 text-[11px] text-gray-500 truncate">
        {video.videoUri || "https://www.youtube.com/"}
      </div>
      <div className="mt-2 truncate text-[12px] font-medium text-gray-800">
        {firstQuestion?.questionText
          ? `Question 1: ${firstQuestion.questionText}`
          : "Question 1: Lorem ipsum dolor sit amet cons..."}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.slice(0, 4).map((option, index) => {
          const optionText = option?.trim() || `Option ${index + 1}`;
          const isCorrect = firstQuestion?.correctAnswer === option && option?.trim();
          return (
            <span
              key={index}
              className={`inline-flex items-center gap-1 rounded-[5px] border px-2 py-1 text-[11px] ${
                isCorrect
                  ? "border-gray-700 text-gray-900 font-medium"
                  : "border-gray-300 text-gray-700"
              }`}
            >
              {isCorrect ? <FaCircle size={6} /> : <FaRegCircle size={7} />}
              {optionText}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Field ───────────────────────────────────────────────── */
const Field = ({ label, required, value, onChange, placeholder }) => (
  <label className="block">
    <div className="mb-1.5 text-[12px] font-semibold text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </div>
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      className="h-9 w-full rounded-[6px] border border-gray-200 bg-[#f1f1f1] px-3 text-[13px] outline-none placeholder:text-gray-400 focus:border-gray-400"
    />
  </label>
);

/* ─── QuizBlock ───────────────────────────────────────────── */
const QuizBlock = ({ question, qIndex, totalQuestions, onChange, onCorrectAnswer, onRemove }) => (
  <div className="space-y-2">
    {/* Question text */}
    <Field
      label="Question"
      required
      value={question.questionText}
      onChange={(e) => onChange(qIndex, "questionText", e.target.value)}
      placeholder="Enter Question"
    />

    {/* Options */}
    <div className="space-y-1.5">
      {question.options.map((opt, oIndex) => {
        const isCorrect = question.correctAnswer === opt && opt.trim();
        return (
          <div key={oIndex} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onCorrectAnswer(qIndex, oIndex)}
              className="shrink-0 text-gray-500 hover:text-gray-800 transition-colors"
              title="Mark as correct answer"
            >
              {isCorrect ? (
                <FaCircle size={9} className="text-gray-800" />
              ) : (
                <FaRegCircle size={10} />
              )}
            </button>
            <input
              value={opt}
              onChange={(e) => {
                const newOptions = [...question.options];
                newOptions[oIndex] = e.target.value;
                onChange(qIndex, "options", newOptions);
                // keep correctAnswer in sync if this option was selected
                if (question.correctAnswer === question.options[oIndex]) {
                  onChange(qIndex, "correctAnswer", e.target.value);
                }
              }}
              placeholder={`Option ${oIndex + 1}`}
              style={{ fontFamily: "'DM Sans', sans-serif" }}
              className="h-9 flex-1 rounded-[6px] border border-gray-200 bg-white px-3 text-[13px] outline-none placeholder:text-gray-400 focus:border-gray-400"
            />
          </div>
        );
      })}
    </div>

    {/* Remove question */}
    {totalQuestions > 1 && (
      <button
        type="button"
        onClick={() => onRemove(qIndex)}
        className="text-[12px] text-gray-400 hover:text-red-500 transition-colors"
      >
        Remove question
      </button>
    )}
  </div>
);

/* ─── Main Component ──────────────────────────────────────── */
const CreateModuleData = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(emptyVideo());
  const [activeQuizIndex, setActiveQuizIndex] = useState(0);

  // Inject DM Sans — same approach as Employee / Task / WalkinList pages
  useEffect(() => {
    if (!document.getElementById("dm-sans-font")) {
      const link = document.createElement("link");
      link.id = "dm-sans-font";
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    if (!id) return;

    const loadModule = async () => {
      try {
        const response = await fetch(`${baseUrl.baseUrl}api/modules/${id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!response.ok) {
          toast.error("Failed to load module for editing.");
          return;
        }

        const data = await response.json();
        setModuleTitle(data?.moduleName || "");
        setModuleDescription(data?.description || "");
        setVideos(Array.isArray(data?.videos) ? data.videos : []);
        setCurrentVideo(emptyVideo());
        setActiveQuizIndex(0);
      } catch (error) {
        toast.error(`Failed to load module: ${error.message}`);
      }
    };

    loadModule();
  }, [id]);

  /* video field changes */
  const handleVideoChange = (field, value) => {
    setCurrentVideo((prev) => ({ ...prev, [field]: value }));
  };

  /* question field changes */
  const handleQuestionChange = (qIndex, field, value) => {
    setCurrentVideo((prev) => {
      const updated = [...prev.questions];
      updated[qIndex] = { ...updated[qIndex], [field]: value };
      return { ...prev, questions: updated };
    });
  };

  /* mark correct answer */
  const handleCorrectAnswerChange = (qIndex, oIndex) => {
    setCurrentVideo((prev) => {
      const updated = [...prev.questions];
      const opt = updated[qIndex].options[oIndex];
      updated[qIndex] = {
        ...updated[qIndex],
        correctAnswer: opt?.trim() ? opt : `Option ${oIndex + 1}`,
      };
      return { ...prev, questions: updated };
    });
  };

  /* add a new quiz question */
  const addQuestion = () => {
    setCurrentVideo((prev) => {
      const updated = { ...prev, questions: [...prev.questions, emptyQuestion()] };
      setActiveQuizIndex(updated.questions.length - 1);
      return updated;
    });
  };

  /* remove a quiz question */
  const removeQuestion = (qIndex) => {
    setCurrentVideo((prev) => {
      if (prev.questions.length <= 1) {
        toast.warning("At least one question is required.");
        return prev;
      }
      const updated = prev.questions.filter((_, i) => i !== qIndex);
      setActiveQuizIndex(Math.min(activeQuizIndex, updated.length - 1));
      return { ...prev, questions: updated };
    });
  };

  /* navigate between quiz questions */
  const prevQuiz = () => setActiveQuizIndex((i) => Math.max(0, i - 1));
  const nextQuiz = () =>
    setActiveQuizIndex((i) => Math.min(currentVideo.questions.length - 1, i + 1));

  /* validation */
  const validateQuestion = (q) => Boolean(q.questionText?.trim());

  const isCurrentVideoReady = useMemo(
    () =>
      Boolean(
        currentVideo.title.trim() &&
          currentVideo.videoUri.trim() &&
          currentVideo.questions.some(validateQuestion)
      ),
    [currentVideo]
  );

  /* build a clean video object */
  const buildVideo = (v) => ({
    title: v.title.trim(),
    videoUri: v.videoUri.trim(),
    questions: v.questions.map((q) => ({
      questionText: q.questionText,
      options: q.options.map((o, oi) => (o.trim() ? o : `Option ${oi + 1}`)),
      correctAnswer: q.correctAnswer || `Option 1`,
    })),
  });

  /* save current video to list and reset */
  const saveCurrentVideo = () => {
    if (!currentVideo.title.trim()) return toast.error("Please enter a video title.");
    if (!currentVideo.videoUri.trim()) return toast.error("Please enter a video URL.");
    if (!currentVideo.questions.some(validateQuestion))
      return toast.error("Please add at least one question.");

    setVideos((prev) => [...prev, buildVideo(currentVideo)]);
    setCurrentVideo(emptyVideo());
    setActiveQuizIndex(0);
    toast.success("Video saved! You can now add the next video.");
  };

  /* remove a saved video */
  const removeVideo = (index) => {
    setVideos((prev) => prev.filter((_, i) => i !== index));
  };

  /* clear everything */
  const clearForm = () => {
    setModuleTitle("");
    setModuleDescription("");
    setVideos([]);
    setCurrentVideo(emptyVideo());
    setActiveQuizIndex(0);
  };

  /* submit module */
  const handleSaveModule = async () => {
    const moduleVideos = isCurrentVideoReady
      ? [...videos, buildVideo(currentVideo)]
      : videos;

    if (!moduleTitle.trim()) return toast.error("Please enter a module title.");
    if (!moduleDescription.trim()) return toast.error("Please enter a module description.");
    if (!moduleVideos.length) return toast.warning("Please add at least one video.");

    const payload = {
      moduleName: moduleTitle.trim(),
      description: moduleDescription.trim(),
      videos: moduleVideos,
      createdBy: getCurrentAdminName(),
    };

    try {
      const response = await fetch(`${baseUrl.baseUrl}api/modules${isEditMode ? `/${id}` : ""}`, {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        toast.error(`Failed to create module: ${response.status} ${response.statusText}`);
        return;
      }

      const data = await response.json();
      toast.success(data.message || (isEditMode ? "Module updated successfully!" : "Module created successfully!"));
      if (isEditMode) {
        navigate("/module");
      } else {
        clearForm();
      }
    } catch (error) {
      toast.error(`Network error: ${error.message}`);
    }
  };

  const activeQ = currentVideo.questions[activeQuizIndex] ?? currentVideo.questions[0];

  return (
    <div className="flex min-h-screen bg-[#f9fafb] text-black" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <SideNav />

      <div className="flex-1 md:ml-[120px] px-6 py-6 pb-10">
        <div className="max-w-[860px]">

          {/* ── Header + basic info (no card, sits on grey bg) ── */}
          <div>

            {/* Header row */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <Link
                  to="/module"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#f4f4f4] text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <IoIosArrowBack size={16} />
                </Link>
                <div>
                  <h1 className="text-[22px] font-bold leading-tight text-gray-900">
                    {isEditMode ? "Edit Module" : "Create New Module"}
                  </h1>
                  <p className="mt-1.5 text-[12px] text-gray-500">
                    Build a comprehensive training program with modules and assessments
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={clearForm}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 text-[12px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FaRegBookmark size={11} />
                  Save as Draft
                </button>
                <button
                  onClick={handleSaveModule}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#111111] px-3 text-[12px] font-medium text-white hover:bg-[#333] transition-colors"
                >
                  <FaRegFileLines size={11} />
                  {isEditMode ? "Update Module" : "Create Training"}
                </button>
              </div>
            </div>

            {/* Basic Information */}
            <div className="mt-5">
              <p className="text-[12px] font-medium text-gray-500 mb-3">Basic Information</p>
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Module Title"
                  required
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  placeholder="Enter module title"
                />
                <Field
                  label="Description"
                  required
                  value={moduleDescription}
                  onChange={(e) => setModuleDescription(e.target.value)}
                  placeholder="Enter Description"
                />
              </div>
            </div>
          </div>

          {/* ── Two-column body (sits on grey bg) ── */}
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-12 md:items-start">

            {/* ── LEFT: Upload Video + Add Quiz ── */}
            <div className="space-y-3 md:col-span-7">

              {/* Upload Video card */}
              <div className="rounded-[8px] border border-gray-200 bg-white p-4">
                <p className="text-[13px] font-semibold text-gray-900 mb-3">Upload Video</p>
                <div className="space-y-3">
                  <Field
                    label="Video Title"
                    required
                    value={currentVideo.title}
                    onChange={(e) => handleVideoChange("title", e.target.value)}
                    placeholder="Enter video title"
                  />
                  <Field
                    label="Video URL"
                    required
                    value={currentVideo.videoUri}
                    onChange={(e) => handleVideoChange("videoUri", e.target.value)}
                    placeholder="Paste video URL (e.g., YouTube or other hosted links)"
                  />
                </div>
              </div>

              {/* Add Quiz card */}
              <div className="rounded-[8px] border border-gray-200 bg-white p-4">
                <p className="text-[13px] font-semibold text-gray-900 mb-3">Add Quiz</p>

                {/* Active question */}
                {activeQ && (
                  <QuizBlock
                    question={activeQ}
                    qIndex={activeQuizIndex}
                    totalQuestions={currentVideo.questions.length}
                    onChange={handleQuestionChange}
                    onCorrectAnswer={handleCorrectAnswerChange}
                    onRemove={removeQuestion}
                  />
                )}

                {/* Add Question button */}
                <button
                  type="button"
                  onClick={addQuestion}
                  className="mt-3 flex h-9 w-full items-center gap-2 rounded-[6px] border border-dashed border-gray-300 px-3 text-[12px] text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
                >
                  <FaPlus size={10} />
                  Add Question
                </button>

                {/* Quiz navigation + Add Quiz */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={prevQuiz}
                      disabled={activeQuizIndex === 0}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#f5f5f5] text-gray-500 disabled:opacity-40 hover:bg-gray-200 transition-colors"
                    >
                      <FaChevronLeft size={10} />
                    </button>
                    <button
                      type="button"
                      onClick={nextQuiz}
                      disabled={activeQuizIndex >= currentVideo.questions.length - 1}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#f5f5f5] text-gray-700 disabled:opacity-40 hover:bg-gray-200 transition-colors"
                    >
                      <FaChevronRight size={10} />
                    </button>
                    {currentVideo.questions.length > 1 && (
                      <span className="text-[11px] text-gray-400">
                        {activeQuizIndex + 1} / {currentVideo.questions.length}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="inline-flex h-8 items-center gap-2 rounded-md bg-[#f5f5f5] px-3 text-[12px] font-medium text-gray-900 hover:bg-gray-200 transition-colors"
                  >
                    <FaPlus size={10} />
                    Add Quiz
                  </button>
                </div>
              </div>

              {/* Preview / Add Next Video */}
              <div className="flex items-center justify-between">
                <Link
                  to="/module"
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-gray-200 bg-white px-4 text-[12px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FaChevronLeft size={10} />
                  Preview
                </Link>
                <button
                  type="button"
                  onClick={saveCurrentVideo}
                  disabled={!isCurrentVideoReady}
                  className={`inline-flex h-9 items-center gap-2 rounded-md px-5 text-[12px] font-semibold transition-colors ${
                    isCurrentVideoReady
                      ? "bg-[#111111] text-white hover:bg-[#333]"
                      : "cursor-not-allowed bg-gray-200 text-gray-400"
                  }`}
                >
                  <FaPlus size={11} />
                  Add Next Video
                </button>
              </div>
            </div>

            {/* ── RIGHT: Saved video cards ── */}
            <div className="space-y-2.5 md:col-span-5">
              {videos.length > 0 ? (
                videos.map((video, index) => (
                  <SavedVideoCard
                    key={`${video.title}-${index}`}
                    video={video}
                    active={index === 0}
                    onRemove={() => removeVideo(index)}
                  />
                ))
              ) : (
                <div className="rounded-[8px] border border-dashed border-gray-300 bg-white p-6 text-center text-[12px] text-gray-400">
                  Added videos will appear here.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateModuleData;
