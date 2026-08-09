import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { io as socketIO } from "socket.io-client";
import baseUrl from "../../api/api";
import SideNav from "../../components/SideNav/SideNav";
import ModileNav from "../../components/SideNav/ModileNav";

/* ─────────────────────────────────────────────────────────────────────────────
   Clean API URL Formatter Helper
   ───────────────────────────────────────────────────────────────────────────── */
const getApiUrl = (endpointPath) => {
  const rawBase = (baseUrl && baseUrl.baseUrl) ? baseUrl.baseUrl : "http://localhost:7000/";
  const cleanBase = rawBase.replace(/\/+$/, "");
  const cleanPath = endpointPath.startsWith("/") ? endpointPath : `/${endpointPath}`;
  return `${cleanBase}${cleanPath}`;
};

/* ─────────────────────────────────────────────────────────────────────────────
   Predefined App Pages for Bug Target Selector
   ───────────────────────────────────────────────────────────────────────────── */
const APP_PAGES = [
  { value: "/", label: "Dashboard / Home" },
  { value: "/store-insights", label: "Store Performance Overview" },
  { value: "/store-analysis/dsr-report", label: "Store Analysis - DSR Report" },
  { value: "/store-analysis/growth-comparison", label: "Store Analysis - Growth Comparison" },
  { value: "/store-analysis/google-review-task", label: "Store Analysis - Google Review" },
  { value: "/store-analysis/store-rating", label: "Store Analysis - Store Rating" },
  { value: "/walkin/list", label: "Walk-In List" },
  { value: "/walkin/report", label: "Walk-In Report" },
  { value: "/walkin/count", label: "Walk-In Count" },
  { value: "/task", label: "Task Management" },
  { value: "/task/create", label: "Create Task" },
  { value: "/task/auto-schedule", label: "Auto Task" },
  { value: "/employee", label: "Employees" },
  { value: "/training-dashboard", label: "Training Dashboard" },
  { value: "/training", label: "Trainings" },
  { value: "/assessments", label: "Assessments" },
  { value: "/module", label: "Modules" },
  { value: "/branch", label: "Branches" },
  { value: "/settings/users", label: "Settings - User Management" },
  { value: "/settings/create-user", label: "Settings - Create User" },
  { value: "/settings/create-notification", label: "Settings - Notifications" },
  { value: "Other / General Site", label: "Other / General Site Issue" },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Ultra-Sleek Professional Voice Note Player (WhatsApp / Slack / Intercom Style)
   ───────────────────────────────────────────────────────────────────────────── */
const SocialVoiceNotePlayer = ({ src, isDarkBg = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const activeAudioRef = useRef(null);
  const timerRef = useRef(null);

  const getCleanAudioSrc = (rawSrc) => {
    if (!rawSrc || typeof rawSrc !== "string") return "";
    if (rawSrc.includes(";codecs=")) {
      return rawSrc.replace(/;codecs=[^;]+/, "");
    }
    return rawSrc;
  };

  const audioSrc = getCleanAudioSrc(src);

  useEffect(() => {
    if (!audioSrc) return;

    try {
      const parts = audioSrc.split(",");
      if (parts.length > 1) {
        const binaryString = atob(parts[1]);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          audioCtx.decodeAudioData(
            bytes.buffer,
            (buffer) => {
              if (buffer && buffer.duration && isFinite(buffer.duration) && buffer.duration > 0) {
                setDuration(buffer.duration);
              }
              audioCtx.close();
            },
            () => {
              audioCtx.close();
            }
          );
        }
      }
    } catch (e) {
      console.error("AudioContext decode error:", e);
    }

    const tempAudio = new Audio();
    tempAudio.preload = "metadata";
    tempAudio.src = audioSrc;

    const handleMetadata = () => {
      if (tempAudio.duration && isFinite(tempAudio.duration) && tempAudio.duration > 0) {
        setDuration(tempAudio.duration);
      }
    };

    tempAudio.addEventListener("loadedmetadata", handleMetadata);
    tempAudio.addEventListener("canplaythrough", handleMetadata);
    tempAudio.addEventListener("durationchange", handleMetadata);

    return () => {
      tempAudio.removeEventListener("loadedmetadata", handleMetadata);
      tempAudio.removeEventListener("canplaythrough", handleMetadata);
      tempAudio.removeEventListener("durationchange", handleMetadata);
    };
  }, [audioSrc]);

  useEffect(() => {
    return () => {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const togglePlay = () => {
    if (!audioSrc) {
      toast.error("No recorded audio file found in this message.");
      return;
    }

    if (isPlaying && activeAudioRef.current) {
      activeAudioRef.current.pause();
      setIsPlaying(false);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const audio = new Audio(audioSrc);
    audio.playbackRate = playbackRate;
    activeAudioRef.current = audio;

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (timerRef.current) clearInterval(timerRef.current);
    };

    audio.onerror = (e) => {
      console.error("Audio playback error:", e);
      setIsPlaying(false);
      if (timerRef.current) clearInterval(timerRef.current);
      toast.error("Could not play audio file.");
    };

    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        if (audio.duration && isFinite(audio.duration)) {
          setDuration(audio.duration);
        }

        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          if (audio) {
            setCurrentTime(audio.currentTime || 0);
          }
        }, 100);
      })
      .catch((err) => {
        console.error("Playback error:", err);
        setIsPlaying(false);
        toast.error("Playback error: " + err.message);
      });
  };

  const handleSeek = (e) => {
    const seekTime = Number(e.target.value);
    setCurrentTime(seekTime);
    if (activeAudioRef.current) {
      activeAudioRef.current.currentTime = seekTime;
    }
  };

  const toggleSpeed = () => {
    const speeds = [1, 1.5, 2];
    const nextSpeed = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (activeAudioRef.current) {
      activeAudioRef.current.playbackRate = nextSpeed;
    }
  };

  const formatTime = (secs) => {
    if (!secs || isNaN(secs) || !isFinite(secs) || secs < 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div
      className={`flex items-center gap-3 p-2.5 rounded-2xl w-full max-w-[300px] border transition-all ${
        isDarkBg
          ? "bg-white/10 border-white/20 text-white"
          : "bg-slate-100 border-slate-200/80 text-slate-900"
      }`}
    >
      <button
        type="button"
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold shadow-sm transition-all cursor-pointer shrink-0 hover:scale-105 active:scale-95 ${
          isDarkBg
            ? "bg-white text-slate-900"
            : "bg-slate-900 text-white"
        }`}
      >
        {isPlaying ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        )}
      </button>

      <div className="flex-1 flex flex-col justify-center gap-1 min-w-0">
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className={`w-full cursor-pointer h-1.5 rounded-lg ${
            isDarkBg ? "accent-white bg-white/30" : "accent-slate-900 bg-slate-300"
          }`}
        />

        <div
          className={`flex items-center justify-between text-[10px] font-mono font-medium px-0.5 ${
            isDarkBg ? "text-slate-200" : "text-slate-500"
          }`}
        >
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={toggleSpeed}
        className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold transition-all cursor-pointer shrink-0 ${
          isDarkBg
            ? "bg-white/20 text-white hover:bg-white/30"
            : "bg-slate-200 text-slate-800 hover:bg-slate-300"
        }`}
      >
        {playbackRate}x
      </button>
    </div>
  );
};

const HelpSupport = () => {
  const user = useSelector((s) => s.auth.user);
  const location = useLocation();
  const token = localStorage.getItem("token");

  // Strict role check: ONLY IT Support Admin (it_admin, super_admin, admin) sees all user queries and channel list
  const userRoleLower = (user?.role || "").toLowerCase();
  const isITSupportAdmin = ["it_admin", "super_admin", "admin"].includes(userRoleLower);

  const [activeTab, setActiveTab] = useState("tickets");

  const [category, setCategory] = useState("Bug / Error");
  const [pageUrl, setPageUrl] = useState("/store-analysis/dsr-report");
  const [priority, setPriority] = useState("Medium");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [screenshotBase64, setScreenshotBase64] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [tickets, setTickets] = useState([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [directChatTicket, setDirectChatTicket] = useState(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatImageBase64, setChatImageBase64] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  const chatBottomRef = useRef(null);
  const socketRef = useRef(null);
  const isCreatingChatRef = useRef(false);
  const hasInteractedRef = useRef(false);

  const fetchTickets = async () => {
    if (!token) return;
    try {
      const response = await fetch(getApiUrl("api/support-tickets"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const contentType = response.headers.get("content-type");
      if (response.ok && contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (data.success) {
          const allFetched = data.tickets || [];
          setTickets(allFetched);

          // Only update directChatTicket if user is already on direct_chat tab
          // Never auto-switch tabs or auto-load tickets on background fetches
          if (directChatTicket?._id && directChatTicket._id !== "direct-chat-thread") {
            const updatedDirect = allFetched.find((t) => t._id === directChatTicket._id);
            if (updatedDirect) {
              setDirectChatTicket(updatedDirect);
            } else {
              // Ticket was deleted from DB — clear it
              setDirectChatTicket(null);
            }
          }

          if (selectedTicket?._id) {
            const updatedSelected = allFetched.find((t) => t._id === selectedTicket._id);
            if (updatedSelected) {
              setSelectedTicket(updatedSelected);
            } else {
              // Ticket was deleted — clear selection
              setSelectedTicket(allFetched.length > 0 ? allFetched[0] : null);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  // ── Real-time Socket.io setup (WhatsApp / Instagram style) ─────────
  useEffect(() => {
    if (!token) return;

    const rawBase = (baseUrl && baseUrl.baseUrl) ? baseUrl.baseUrl : "http://localhost:7000/";
    const socketBase = rawBase.replace(/\/+$/, "");

    const socket = socketIO(socketBase, {
      transports: ["websocket", "polling"],
      auth: { token },
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
    });

    socketRef.current = socket;

    const joinCurrentRooms = () => {
      // Each user joins their personal room immediately — guarantees delivery
      // of IT admin replies even before the ticket list has loaded
      const userId = user?._id || user?.userId;
      if (userId) {
        socket.emit("join_user", userId);
      }

      // IT admins join a special room to receive all ticket notifications
      if (isITSupportAdmin) {
        socket.emit("join_it_admin");
      }
      // Join the currently active ticket room (works for both user and IT admin)
      const ticketId = selectedTicketRef.current?._id || directChatTicketRef.current?._id;
      if (ticketId && ticketId !== "direct-chat-thread") {
        socket.emit("join_ticket", ticketId);
      }
    };

    socket.on("connect", () => {
      console.log("✅ Support socket connected:", socket.id);
      joinCurrentRooms();
    });

    // Re-join rooms after reconnection (network blip recovery)
    socket.on("reconnect", () => {
      console.log("🔄 Support socket reconnected — rejoining rooms");
      joinCurrentRooms();
    });

    socket.on("disconnect", () => {
      console.log("🔌 Support socket disconnected");
    });

    // New message arrived on a ticket we're watching
    socket.on("new_message", ({ ticketId, ticket: updatedTicket }) => {
      setTickets((prev) =>
        prev.map((t) => (t._id === updatedTicket._id ? updatedTicket : t))
      );
      setDirectChatTicket((prev) =>
        prev?._id === updatedTicket._id ? updatedTicket : prev
      );
      setSelectedTicket((prev) =>
        prev?._id === updatedTicket._id ? updatedTicket : prev
      );
    });

    // IT admin room: a brand new ticket was raised by someone
    socket.on("new_ticket", (newTicket) => {
      setTickets((prev) => {
        const exists = prev.some((t) => t._id === newTicket._id);
        return exists ? prev : [newTicket, ...prev];
      });
    });

    // Ticket updated (status change, etc.) — visible to both owner and IT admin
    socket.on("ticket_updated", (updatedTicket) => {
      setTickets((prev) =>
        prev.map((t) => (t._id === updatedTicket._id ? updatedTicket : t))
      );
      setDirectChatTicket((prev) =>
        prev?._id === updatedTicket._id ? updatedTicket : prev
      );
      setSelectedTicket((prev) =>
        prev?._id === updatedTicket._id ? updatedTicket : prev
      );
    });

    // Ticket deleted — remove from state immediately
    socket.on("ticket_deleted", ({ ticketId }) => {
      setTickets((prev) => prev.filter((t) => t._id !== ticketId));
      setDirectChatTicket((prev) => {
        if (prev?._id === ticketId) {
          setActiveTab("tickets"); // kick user back to tickets tab
          return null;
        }
        return prev;
      });
      setSelectedTicket((prev) => (prev?._id === ticketId ? null : prev));
    });

    // Status updated
    socket.on("ticket_status_updated", ({ ticket: updatedTicket }) => {
      setTickets((prev) =>
        prev.map((t) => (t._id === updatedTicket._id ? updatedTicket : t))
      );
      setSelectedTicket((prev) =>
        prev?._id === updatedTicket._id ? updatedTicket : prev
      );
    });

    // Initial data load
    fetchTickets();

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  // Keep refs in sync so the connect handler can always read the latest active ticket
  const selectedTicketRef = useRef(selectedTicket);
  const directChatTicketRef = useRef(directChatTicket);
  useEffect(() => { selectedTicketRef.current = selectedTicket; }, [selectedTicket]);
  useEffect(() => { directChatTicketRef.current = directChatTicket; }, [directChatTicket]);

  // Join / leave socket room whenever the active ticket changes
  useEffect(() => {
    const socket = socketRef.current;
    // Socket might not be connected yet on first render — that's fine,
    // joinCurrentRooms() inside the connect handler will pick it up once connected.
    if (!socket) return;

    const ticketId = selectedTicket?._id || directChatTicket?._id;
    if (!ticketId || ticketId === "direct-chat-thread") return;

    socket.emit("join_ticket", ticketId);
    return () => {
      socket.emit("leave_ticket", ticketId);
    };
  }, [selectedTicket?._id, directChatTicket?._id]);
  // ─────────────────────────────────────────────────────────────────────

  // IT admin: open a specific user's direct chat thread by userId
  const handleOpenUserDirectChat = async (channel) => {
    setActiveTab("direct_chat");
    setDirectChatTicket(channel);
    setSelectedTicket(channel);
  };

  const handleOpenDirectChat = async () => {
    // IT admins don't get their own chat thread — they use the sidebar to pick a user
    if (isITSupportAdmin) {
      setActiveTab("direct_chat");
      return;
    }

    setActiveTab("direct_chat");

    // If we already have a valid ticket in state, no need to hit the server
    if (directChatTicket?._id && directChatTicket._id !== "direct-chat-thread") {
      return;
    }

    // Try GET — load existing ticket without creating anything
    try {
      const getResp = await fetch(getApiUrl("api/support-tickets/general-chat"), {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const getContentType = getResp.headers.get("content-type");
      if (getResp.ok && getContentType?.includes("application/json")) {
        const getData = await getResp.json();
        if (getData.success && getData.ticket) {
          setDirectChatTicket(getData.ticket);
          setSelectedTicket(getData.ticket);
          setTickets((prev) => {
            const exists = prev.some((t) => t._id === getData.ticket._id);
            return exists
              ? prev.map((t) => (t._id === getData.ticket._id ? getData.ticket : t))
              : [getData.ticket, ...prev];
          });
        }
        // If 404 — ticket was deleted, leave directChatTicket as null
        // The chat UI will show an empty state; ticket gets created only on first send
      }
    } catch (error) {
      console.warn("Direct chat load warning:", error);
    }
  };

  // Creates the direct chat ticket on demand — only called when user actually sends a message
  const ensureDirectChatTicket = async () => {
    if (directChatTicket?._id && directChatTicket._id !== "direct-chat-thread") {
      return directChatTicket._id;
    }

    if (isCreatingChatRef.current) return null;
    isCreatingChatRef.current = true;

    try {
      const postResp = await fetch(getApiUrl("api/support-tickets/general-chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const postContentType = postResp.headers.get("content-type");
      if ((postResp.ok || postResp.status === 201) && postContentType?.includes("application/json")) {
        const postData = await postResp.json();
        if (postData.success && postData.ticket) {
          setDirectChatTicket(postData.ticket);
          setSelectedTicket(postData.ticket);
          setTickets((prev) => {
            const exists = prev.some((t) => t._id === postData.ticket._id);
            return exists ? prev : [postData.ticket, ...prev];
          });
          return postData.ticket._id;
        }
      }
    } catch (error) {
      console.warn("Direct chat create warning:", error);
    } finally {
      isCreatingChatRef.current = false;
    }
    return null;
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedTicket?.messages, directChatTicket?.messages]);

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Screenshot size must be under 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleChatImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be under 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setChatImageBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      setRecordedAudioUrl("");

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());

        if (audioBlob.size === 0) {
          toast.error("Microphone returned no audio data. Please check Windows microphone permissions.");
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          let audioBase64 = reader.result;
          if (typeof audioBase64 === "string" && audioBase64.includes(";codecs=")) {
            audioBase64 = audioBase64.replace(/;codecs=[^;]+/, "");
          }
          setRecordedAudioUrl(audioBase64);
          toast.success("Voice note recorded! Click 'Test Play 🔊' to test audio or 'Send' to post.");
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone error:", err);
      toast.error("Could not access microphone: " + err.message);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    }
  };

  const cancelVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = null;
      if (mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      setRecordedAudioUrl("");
      clearInterval(recordingTimerRef.current);
      toast.info("Voice recording cancelled.");
    }
  };

  const sendVoiceNoteMessage = async (audioBase64) => {
    if (!audioBase64) return;

    setIsSendingMessage(true);
    let targetId = activeTab === "direct_chat" ? await ensureDirectChatTicket() : selectedTicket?._id;

    const newVoiceMessage = {
      sender: isITSupportAdmin ? "it_admin" : "user",
      senderName: user?.name || (isITSupportAdmin ? "IT Support Admin" : "User"),
      senderRole: user?.role || "employee",
      text: "🎤 Voice Note",
      audioUrl: audioBase64,
      attachments: [audioBase64],
      mediaType: "audio",
      createdAt: new Date(),
    };

    if (activeTab === "direct_chat" && directChatTicket) {
      setDirectChatTicket({
        ...directChatTicket,
        messages: [...(directChatTicket.messages || []), newVoiceMessage],
      });
    } else if (selectedTicket) {
      setSelectedTicket({
        ...selectedTicket,
        messages: [...(selectedTicket.messages || []), newVoiceMessage],
      });
    }

    try {
      if (targetId && targetId !== "direct-chat-thread") {
        const response = await fetch(
          getApiUrl(`api/support-tickets/${targetId}/messages`),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              text: "🎤 Voice Note",
              audioUrl: audioBase64,
              attachments: [audioBase64],
              mediaType: "audio",
            }),
          }
        );

        const contentType = response.headers.get("content-type");
        if (response.ok && contentType && contentType.includes("application/json")) {
          const data = await response.json();
          if (data.success) {
            if (activeTab === "direct_chat") {
              setDirectChatTicket(data.ticket);
            } else {
              setSelectedTicket(data.ticket);
            }
            fetchTickets();
            toast.success("Voice note sent successfully!");
          }
        }
      }
    } catch (error) {
      console.error("Error sending voice note:", error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toast.error("Please fill in Subject and Description.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(getApiUrl("api/support-tickets"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category,
          pageUrl,
          priority,
          subject,
          description,
          screenshotUrl: screenshotBase64,
        }),
      });

      const contentType = response.headers.get("content-type");
      if (response.ok && contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (data.success) {
          toast.success("Support ticket raised successfully!");
          setSubject("");
          setDescription("");
          setScreenshotBase64("");
          fetchTickets();
          setActiveTab("tickets");
          setSelectedTicket(data.ticket);
        } else {
          toast.error(data.message || "Failed to submit ticket.");
        }
      }
    } catch (error) {
      console.error("Error submitting ticket:", error);
      toast.error("Failed to submit ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() && !chatImageBase64) return;

    setIsSendingMessage(true);
    let targetId = activeTab === "direct_chat" ? await ensureDirectChatTicket() : selectedTicket?._id;

    const newTextMessage = {
      sender: isITSupportAdmin ? "it_admin" : "user",
      senderName: user?.name || (isITSupportAdmin ? "IT Support Admin" : "User"),
      senderRole: user?.role || "employee",
      text: chatMessage,
      attachments: chatImageBase64 ? [chatImageBase64] : [],
      mediaType: chatImageBase64 ? "image" : "text",
      createdAt: new Date(),
    };

    if (activeTab === "direct_chat" && directChatTicket) {
      setDirectChatTicket({
        ...directChatTicket,
        messages: [...(directChatTicket.messages || []), newTextMessage],
      });
    } else if (selectedTicket) {
      setSelectedTicket({
        ...selectedTicket,
        messages: [...(selectedTicket.messages || []), newTextMessage],
      });
    }

    const currentMsgText = chatMessage;
    const currentImg = chatImageBase64;

    setChatMessage("");
    setChatImageBase64("");

    try {
      if (targetId && targetId !== "direct-chat-thread") {
        const response = await fetch(
          getApiUrl(`api/support-tickets/${targetId}/messages`),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              text: currentMsgText,
              attachments: currentImg ? [currentImg] : [],
              mediaType: currentImg ? "image" : "text",
            }),
          }
        );

        const contentType = response.headers.get("content-type");
        if (response.ok && contentType && contentType.includes("application/json")) {
          const data = await response.json();
          if (data.success) {
            if (activeTab === "direct_chat") {
              setDirectChatTicket(data.ticket);
            } else {
              setSelectedTicket(data.ticket);
            }
            fetchTickets();
          }
        }
      }
    } catch (error) {
      console.error("Error sending chat message:", error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm("Delete this ticket permanently? This cannot be undone.")) return;
    try {
      const response = await fetch(getApiUrl(`api/support-tickets/${ticketId}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Ticket deleted.");
        setTickets((prev) => prev.filter((t) => t._id !== ticketId));
        setDirectChatTicket((prev) => (prev?._id === ticketId ? null : prev));
        setSelectedTicket((prev) => (prev?._id === ticketId ? null : prev));
      } else {
        toast.error(data.message || "Failed to delete ticket.");
      }
    } catch (error) {
      console.error("Error deleting ticket:", error);
      toast.error("Failed to delete ticket.");
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    let targetId = activeTab === "direct_chat" ? directChatTicket?._id : selectedTicket?._id;
    if (!targetId || targetId === "direct-chat-thread") return;

    try {
      const response = await fetch(
        getApiUrl(`api/support-tickets/${targetId}/status`),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const contentType = response.headers.get("content-type");
      if (response.ok && contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (data.success) {
          toast.success(`Ticket marked as ${newStatus}`);
          if (activeTab === "direct_chat") {
            setDirectChatTicket(data.ticket);
          } else {
            setSelectedTicket(data.ticket);
          }
          fetchTickets();
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter === "All") return true;
    return t.status === statusFilter;
  });

  const directChatChannels = tickets.filter((t) => t.category === "General IT Inquiry");

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  /* ─────────────────────────────────────────────────────────────────────────
     Ultra-Clean Professional Message Stream Renderer
     ───────────────────────────────────────────────────────────────────────── */
  const renderMessageThread = (messages) => {
    const cleanMessages = (messages || []).filter(
      (msg) => !msg.text?.includes("Welcome to IT Direct Support")
    );
    return cleanMessages.map((msg, idx) => {
      const isMe =
        (isITSupportAdmin && msg.sender === "it_admin") ||
        (!isITSupportAdmin && msg.sender === "user") ||
        msg.senderName === user?.name ||
        msg.senderName === user?.username;

      const hasImage =
        Array.isArray(msg.attachments) &&
        msg.attachments.some((imgUrl) => typeof imgUrl === "string" && !imgUrl.startsWith("data:audio"));

      const audioSrcPayload =
        msg.audioUrl ||
        (Array.isArray(msg.attachments) && msg.attachments.find((a) => typeof a === "string" && a.startsWith("data:audio"))) ||
        "";

      const hasAudio = !!audioSrcPayload;
      const isVoiceNote = (msg.mediaType === "audio" || hasAudio) && hasAudio;
      const showText = msg.text && (msg.text !== "🎤 Voice Note" || !hasAudio);

      return (
        <div
          key={idx}
          className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
        >
          <div className="flex items-center gap-1.5 mb-1 px-1">
            <span className="text-[11px] font-semibold text-slate-500">
              {msg.sender === "it_admin"
                ? `${msg.senderName || "IT Support"} (IT Support)`
                : `${msg.senderName || "User"} (${
                    msg.senderRole
                      ? msg.senderRole.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                      : "User"
                  })`}
            </span>
            <span className="text-[10px] text-slate-400">
              {new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div
            className={`max-w-md p-3.5 rounded-2xl text-xs font-normal shadow-xs leading-relaxed flex flex-col gap-2 ${
              isMe
                ? "bg-slate-900 text-white rounded-tr-xs"
                : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs"
            }`}
          >
            {showText && (
              <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
            )}

            {hasImage && (
              <div className="mt-1 flex flex-wrap gap-2">
                {msg.attachments
                  .filter((imgUrl) => typeof imgUrl === "string" && !imgUrl.startsWith("data:audio"))
                  .map((imgUrl, imgIdx) => (
                    <a
                      key={imgIdx}
                      href={imgUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group"
                    >
                      <img
                        src={imgUrl}
                        alt="Chat Attachment"
                        className="max-w-xs max-h-56 rounded-xl border border-slate-200 shadow-sm group-hover:opacity-90 transition-all object-cover"
                      />
                    </a>
                  ))}
              </div>
            )}

            {isVoiceNote && (
              <div className="mt-1">
                <SocialVoiceNotePlayer src={audioSrcPayload} isDarkBg={isMe} />
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="flex w-full min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      <SideNav />
      <div className="md:hidden">
        <ModileNav />
      </div>

      <div className="flex-1 md:ml-[110px] min-h-screen p-4 sm:p-6 lg:p-8 mb-[70px] md:mb-0">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-9 h-9 rounded-2xl bg-slate-900 text-white shadow-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </span>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">Help & IT Support</h1>
            </div>
            <p className="text-slate-500 text-xs font-medium mt-1">
              Report site issues, chat live with IT Team, send images, and record voice notes for quick clarity.
            </p>
          </div>

          {/* Navigation Pill Tabs */}
          <div className="flex bg-slate-200/70 p-1 rounded-full border border-slate-300/60 self-start sm:self-auto overflow-x-auto">
            <button
              type="button"
              onClick={handleOpenDirectChat}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "direct_chat"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>IT Direct Chat</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("raise")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === "raise"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Raise a Bug
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("tickets")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "tickets"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>{isITSupportAdmin ? "IT Inbox & Tickets" : "My Tickets"}</span>
              {tickets.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-700 text-white font-bold">
                  {tickets.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── TAB 1: DEDICATED DIRECT IT CHAT MESSENGER ── */}
        {activeTab === "direct_chat" && (
          <div className="max-w-6xl mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-sm grid grid-cols-1 lg:grid-cols-12 h-[calc(100vh-210px)] min-h-[600px] overflow-hidden">
            
            {/* Left User Chat Channels Sidebar - ONLY FOR IT SUPPORT ADMIN (it_admin or super_admin) */}
            {isITSupportAdmin && (
              <div className="lg:col-span-4 border-r border-slate-200/80 flex flex-col bg-slate-50/50 overflow-hidden">
                <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      User Support Queries
                    </h2>
                    <p className="text-[10.5px] text-slate-500 font-medium">
                      Select user to reply to their support channel
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-900 text-white font-bold">
                    {directChatChannels.length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto sidebar-scroll p-3 flex flex-col gap-2">
                  {directChatChannels.length === 0 ? (
                    <div className="text-center py-10 px-4">
                      <p className="text-xs font-bold text-slate-500">No active user queries yet.</p>
                      <p className="text-[10.5px] text-slate-400 mt-1">
                        When users submit queries or send messages, their private chat channels will appear here for IT Support.
                      </p>
                    </div>
                  ) : (
                    directChatChannels.map((channel) => {
                      const isSelected = directChatTicket?._id === channel._id;
                      const validMsgs = (channel.messages || []).filter(
                        (m) => !m.text?.includes("Welcome to IT Direct Support")
                      );
                      const lastMsg = validMsgs.length > 0 ? validMsgs[validMsgs.length - 1] : null;

                      return (
                        <div
                          key={channel._id}
                          onClick={() => handleOpenUserDirectChat(channel)}
                          className={`p-3 rounded-2xl cursor-pointer transition-all border flex items-center gap-3 ${
                            isSelected
                              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                              : "bg-white hover:bg-slate-100/80 text-slate-900 border-slate-200/80"
                          }`}
                        >
                          <div className="relative shrink-0">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                                isSelected
                                  ? "bg-white text-slate-900"
                                  : "bg-slate-900 text-white"
                              }`}
                            >
                              {channel.userName?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="text-xs font-bold truncate">
                                {channel.userName}
                              </h3>
                              <span
                                className={`text-[9.5px] font-medium ${
                                  isSelected ? "text-slate-300" : "text-slate-400"
                                }`}
                              >
                                {new Date(channel.updatedAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>

                            <p
                              className={`text-[11px] truncate mt-0.5 font-medium ${
                                isSelected ? "text-slate-300" : "text-slate-500"
                              }`}
                            >
                              {lastMsg?.text || "Direct Support Channel"}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Main Active Direct Chat Room Window */}
            <div className={`flex flex-col h-full overflow-hidden ${isITSupportAdmin ? "lg:col-span-8" : "lg:col-span-12"}`}>
              {/* Clean Light Messenger Header */}
              <div className="px-6 py-4 bg-slate-50/90 text-slate-900 flex items-center justify-between border-b border-slate-200/80">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      {isITSupportAdmin && directChatTicket?.userName
                        ? directChatTicket.userName.charAt(0).toUpperCase()
                        : "IT"}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-900">
                        {isITSupportAdmin
                          ? `Direct Chat with ${directChatTicket?.userName || "User"}`
                          : "IT Support Direct Desk"}
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        🟢 Online & Active
                      </span>
                    </div>
                    <p className="text-[11.5px] text-slate-500 font-medium">
                      {isITSupportAdmin
                        ? `Viewing private support thread for user ${directChatTicket?.userName || "User"}`
                        : "Private end-to-end direct channel with IT Support Team"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-block text-[11px] font-semibold bg-slate-200/80 text-slate-700 px-3 py-1 rounded-xl">
                    Channel: {directChatTicket?.ticketId || "DIRECT"}
                  </span>
                  {isITSupportAdmin && directChatTicket?._id && (
                    <button
                      type="button"
                      onClick={() => handleDeleteTicket(directChatTicket._id)}
                      className="px-2.5 py-1 text-[11px] font-bold text-red-600 hover:text-white hover:bg-red-600 bg-red-50 border border-red-200 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                      title="Delete this chat channel"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {/* Direct Chat Stream */}
              <div className="flex-1 overflow-y-auto sidebar-scroll p-4 sm:p-6 flex flex-col gap-4 bg-[#f8fafc]">
                {directChatTicket ? (
                  <>
                    <div className="text-center py-1.5">
                      <span className="px-3 py-1 bg-slate-200/60 text-slate-600 rounded-full text-[10.5px] font-semibold">
                        🔒 Private Channel: {isITSupportAdmin ? (directChatTicket?.userName || "User") : user?.name} & IT Support
                      </span>
                    </div>
                    {renderMessageThread(directChatTicket?.messages)}
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-16">
                    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-slate-700">No active chat thread</p>
                    <p className="text-xs text-slate-400 max-w-xs">Send a message below to start a new direct chat with IT Support.</p>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Direct Chat Input Footer */}
              <div className="p-3 sm:p-4 bg-white border-t border-slate-200/80 flex flex-col gap-2">
                {chatImageBase64 && (
                  <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start">
                    <img
                      src={chatImageBase64}
                      alt="Image Attachment Preview"
                      className="w-12 h-12 object-cover rounded-lg border border-slate-300"
                    />
                    <span className="text-xs font-bold text-slate-700">Image Attached</span>
                    <button
                      type="button"
                      onClick={() => setChatImageBase64("")}
                      className="ml-2 w-5 h-5 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center cursor-pointer hover:bg-rose-700"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {recordedAudioUrl ? (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-100 border border-slate-200 p-3 rounded-2xl w-full">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🎤</span>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          Voice Note Recorded ({recordingTime}s)
                        </span>
                        <span className="text-[10.5px] text-slate-600 font-medium">
                          Click "Test Play 🔊" to verify audio sound before sending
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const testAudio = new Audio(recordedAudioUrl);
                          testAudio.play().catch((e) => toast.error("Preview playback error: " + e.message));
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>▶ Test Play 🔊</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRecordedAudioUrl("")}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        Discard
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          sendVoiceNoteMessage(recordedAudioUrl);
                          setRecordedAudioUrl("");
                        }}
                        disabled={isSendingMessage}
                        className="px-4 py-1.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <span>Send Voice Note 🚀</span>
                      </button>
                    </div>
                  </div>
                ) : isRecording ? (
                  <div className="flex items-center justify-between bg-rose-50 border border-rose-200 p-3 rounded-2xl animate-pulse">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
                      <span className="text-xs font-bold text-rose-700">
                        Recording Your Voice... ({formatTimer(recordingTime)})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={cancelVoiceRecording}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={stopVoiceRecording}
                        className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                      >
                        Stop Recording ⏹
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <label
                      title="Attach Image"
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-2xl cursor-pointer transition-colors shrink-0"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleChatImageChange}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={startVoiceRecording}
                      title="Record Voice Note"
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl cursor-pointer transition-colors shrink-0 flex items-center justify-center"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" y1="19" x2="12" y2="23" />
                        <line x1="8" y1="23" x2="16" y2="23" />
                      </svg>
                    </button>

                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder={`Type message to ${isITSupportAdmin ? (directChatTicket?.userName || "User") : "IT Support Team"} (or attach image / record voice note)...`}
                      className="flex-1 h-11 px-4 bg-slate-100 rounded-2xl text-xs font-normal text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 border border-transparent focus:border-slate-300 transition-all placeholder-slate-400"
                    />

                    <button
                      type="submit"
                      disabled={isSendingMessage || (!chatMessage.trim() && !chatImageBase64)}
                      className="px-5 h-11 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-2xl shadow-sm transition-all cursor-pointer disabled:opacity-40 shrink-0 flex items-center gap-1.5"
                    >
                      <span>Send</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: RAISE A BUG FORM ── */}
        {activeTab === "raise" && (
          <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-lg font-bold text-slate-900">Report a New Bug or Issue</h2>
              <p className="text-xs text-slate-500 font-medium">
                Describe the problem you experienced on the website so IT Support can fix it promptly.
              </p>
            </div>

            <form onSubmit={handleSubmitTicket} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Issue Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 transition-all"
                  >
                    <option value="Bug / Error">Bug / Error</option>
                    <option value="UI Layout Issue">UI Layout Issue</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="Performance / Lag">Performance / Lag</option>
                    <option value="General IT Inquiry">General IT Inquiry</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Affected Page <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={pageUrl}
                    onChange={(e) => setPageUrl(e.target.value)}
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 transition-all"
                  >
                    {APP_PAGES.map((pg) => (
                      <option key={pg.value} value={pg.value}>
                        {pg.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Priority Level <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 transition-all"
                  >
                    <option value="Low">Low - Cosmetic tweak</option>
                    <option value="Medium">Medium - Normal bug</option>
                    <option value="High">High - Major page error</option>
                    <option value="Critical">Critical - System down</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Subject / Summary <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Graph Y-Axis values unformatted on Store Insights"
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 transition-all placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Detailed Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe what steps led to the issue, what happened, and what you expected to see..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 transition-all placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Attach Screenshot (Optional)
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <label className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-2xl text-xs font-bold text-slate-800 cursor-pointer transition-all">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span>Choose Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotChange}
                      className="hidden"
                    />
                  </label>

                  {screenshotBase64 && (
                    <div className="relative group">
                      <img
                        src={screenshotBase64}
                        alt="Screenshot Preview"
                        className="w-24 h-16 object-cover rounded-xl border-2 border-black/10 shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => setScreenshotBase64("")}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center shadow-md cursor-pointer hover:bg-rose-700"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-slate-900 hover:bg-black text-white font-extrabold text-xs rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Submitting Ticket...</span>
                  ) : (
                    <>
                      <span>Submit Bug Report</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── TAB 3: TICKETS INBOX & THREAD VIEW ── */}
        {activeTab === "tickets" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-210px)] min-h-[600px]">
            <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900">
                    {isITSupportAdmin ? "IT Support Inbox" : "My Support Conversations"}
                  </h2>
                  <button
                    type="button"
                    onClick={fetchTickets}
                    title="Refresh Conversations"
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 4v6h-6" />
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center gap-1 overflow-x-auto sidebar-scroll pb-1">
                  {["All", "Open", "In Progress", "Resolved", "Closed"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                        statusFilter === st
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto sidebar-scroll p-3 flex flex-col gap-2">
                {isLoadingTickets ? (
                  <div className="text-center py-10 text-xs font-semibold text-slate-400">
                    Loading conversations...
                  </div>
                ) : filteredTickets.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <p className="text-xs font-bold text-slate-500">No conversations found.</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {statusFilter !== "All"
                        ? `No tickets matching filter "${statusFilter}"`
                        : "Click 'IT Direct Chat' or 'Raise a Bug' to start."}
                    </p>
                  </div>
                ) : (
                  filteredTickets.map((t) => {
                    const isSelected = selectedTicket?._id === t._id;
                    const isDirect = t.category === "General IT Inquiry";

                    return (
                      <div
                        key={t._id}
                        onClick={() => setSelectedTicket(t)}
                        className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${
                          isSelected
                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                            : "bg-slate-50/70 hover:bg-slate-100/90 text-slate-900 border-slate-100"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                isSelected
                                  ? "bg-white/20 text-white"
                                  : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              {t.ticketId}
                            </span>
                            {isDirect && (
                              <span className="text-[9.5px] font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-500/30 px-1.5 py-0.5 rounded">
                                Direct Chat
                              </span>
                            )}
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              t.status === "Open"
                                ? "bg-amber-400 text-amber-950 font-black"
                                : t.status === "In Progress"
                                ? "bg-slate-800 text-white font-black"
                                : "bg-emerald-500 text-white font-black"
                            }`}
                          >
                            {t.status}
                          </span>
                        </div>

                        <h3 className="text-xs font-bold truncate leading-snug">{t.subject}</h3>

                        <div className="flex items-center justify-between text-[10.5px] mt-2 font-medium">
                          <span className={isSelected ? "text-slate-300" : "text-slate-500"}>
                            {t.userName} ({t.userRole})
                          </span>
                          <span className={isSelected ? "text-slate-400" : "text-slate-400"}>
                            {new Date(t.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col overflow-hidden">
              {selectedTicket ? (
                <>
                  <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900 bg-slate-200 px-2.5 py-0.5 rounded-lg border border-slate-300">
                          {selectedTicket.ticketId}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {selectedTicket.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            selectedTicket.priority === "Critical"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {selectedTicket.priority} Priority
                        </span>
                      </div>
                      <h2 className="text-base font-extrabold text-slate-900 leading-snug">
                        {selectedTicket.subject}
                      </h2>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                        Reported by <strong className="text-slate-800">{selectedTicket.userName}</strong> ({selectedTicket.userEmail}) on Page: <span className="font-mono text-slate-800 font-bold">{selectedTicket.pageUrl}</span>
                      </p>
                    </div>

                    {isITSupportAdmin && (
                      <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                        {["In Progress", "Resolved", "Closed"].map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleUpdateStatus(st)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                              selectedTicket.status === st
                                ? "bg-slate-900 text-white shadow-xs"
                                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleDeleteTicket(selectedTicket._id)}
                          title="Delete this ticket permanently"
                          className="px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 flex items-center gap-1"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4h6v2" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto sidebar-scroll p-4 sm:p-6 flex flex-col gap-4 bg-[#fafafa]">
                    <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs mb-2">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Initial Topic / Inquiry
                      </div>
                      <p className="text-xs text-slate-800 font-medium whitespace-pre-line leading-relaxed">
                        {selectedTicket.description}
                      </p>

                      {selectedTicket.screenshotUrl && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                            Attached Screenshot:
                          </span>
                          <a
                            href={selectedTicket.screenshotUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block group"
                          >
                            <img
                              src={selectedTicket.screenshotUrl}
                              alt="Attached Screenshot"
                              className="max-w-xs max-h-48 rounded-xl border border-slate-200 shadow-sm group-hover:opacity-90 transition-all object-cover"
                            />
                          </a>
                        </div>
                      )}
                    </div>

                    {renderMessageThread(selectedTicket.messages)}
                    <div ref={chatBottomRef} />
                  </div>

                  <div className="p-3 sm:p-4 bg-white border-t border-slate-200/80 flex flex-col gap-2">
                    {chatImageBase64 && (
                      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start">
                        <img
                          src={chatImageBase64}
                          alt="Image Attachment Preview"
                          className="w-12 h-12 object-cover rounded-lg border border-slate-300"
                        />
                        <span className="text-xs font-bold text-slate-700">Image Attached</span>
                        <button
                          type="button"
                          onClick={() => setChatImageBase64("")}
                          className="ml-2 w-5 h-5 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center cursor-pointer hover:bg-rose-700"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    {recordedAudioUrl ? (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-100 border border-slate-200 p-3 rounded-2xl w-full">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">🎤</span>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">
                              Voice Note Recorded ({recordingTime}s)
                            </span>
                            <span className="text-[10.5px] text-slate-600 font-medium">
                              Click "Test Play 🔊" to verify audio sound before sending
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const testAudio = new Audio(recordedAudioUrl);
                              testAudio.play().catch((e) => toast.error("Preview playback error: " + e.message));
                            }}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1"
                          >
                            <span>▶ Test Play 🔊</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setRecordedAudioUrl("")}
                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
                          >
                            Discard
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              sendVoiceNoteMessage(recordedAudioUrl);
                              setRecordedAudioUrl("");
                            }}
                            disabled={isSendingMessage}
                            className="px-4 py-1.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                          >
                            <span>Send Voice Note 🚀</span>
                          </button>
                        </div>
                      </div>
                    ) : isRecording ? (
                      <div className="flex items-center justify-between bg-rose-50 border border-rose-200 p-3 rounded-2xl animate-pulse">
                        <div className="flex items-center gap-2.5">
                          <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
                          <span className="text-xs font-bold text-rose-700">
                            Recording Your Voice... ({formatTimer(recordingTime)})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={cancelVoiceRecording}
                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={stopVoiceRecording}
                            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                          >
                            Stop Recording ⏹
                          </button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <label
                          title="Attach Image"
                          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-2xl cursor-pointer transition-colors shrink-0"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleChatImageChange}
                            className="hidden"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={startVoiceRecording}
                          title="Record Voice Note"
                          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl cursor-pointer transition-colors shrink-0 flex items-center justify-center"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                            <line x1="12" y1="19" x2="12" y2="23" />
                            <line x1="8" y1="23" x2="16" y2="23" />
                          </svg>
                        </button>

                        <input
                          type="text"
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          placeholder="Type message to IT Team (or attach image / record voice note)..."
                          className="flex-1 h-11 px-4 bg-slate-100 rounded-2xl text-xs font-normal text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 border border-transparent focus:border-slate-300 transition-all placeholder-slate-400"
                        />

                        <button
                          type="submit"
                          disabled={isSendingMessage || (!chatMessage.trim() && !chatImageBase64)}
                          className="px-5 h-11 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-2xl shadow-sm transition-all cursor-pointer disabled:opacity-40 shrink-0 flex items-center gap-1.5"
                        >
                          <span>Send</span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                          </svg>
                        </button>
                      </form>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-slate-700">No Conversation Selected</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Click <strong>IT Direct Chat</strong> or select a ticket from the left inbox to start chatting, sending images, or recording voice notes.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpSupport;
