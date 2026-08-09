import SupportTicket from "../model/SupportTicket.js";
import Admin from "../model/Admin.js";
import User from "../model/User.js";
import { getIO } from "../lib/socket.js";

// Helper to generate Ticket ID (e.g., TK-1001)
const generateTicketId = async () => {
  // Use timestamp + random suffix to avoid collisions after manual DB deletions
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `TK-${ts}-${rand}`;
};

// Helper to get active user details from JWT token context (req.admin or req.user)
const getUserContext = async (req) => {
  const authObj = req.admin || req.user || {};
  const userId = authObj.userId || authObj._id;
  
  if (userId) {
    const adminDoc = await Admin.findById(userId);
    if (adminDoc) {
      return {
        _id: adminDoc._id,
        name: adminDoc.name,
        email: adminDoc.email,
        role: adminDoc.role,
      };
    }
    const userDoc = await User.findById(userId);
    if (userDoc) {
      return {
        _id: userDoc._id,
        name: userDoc.username,
        email: userDoc.email,
        role: userDoc.designation || "employee",
      };
    }
  }

  return {
    _id: userId || null,
    name: authObj.name || authObj.username || "User",
    email: authObj.email || "",
    role: authObj.role || "employee",
  };
};

// Create a new support ticket (User)
export const createTicket = async (req, res) => {
  try {
    const { category, pageUrl, subject, description, screenshotUrl, priority } = req.body;

    if (!subject || !description) {
      return res.status(400).json({ success: false, message: "Subject and Description are required." });
    }

    const currentUser = await getUserContext(req);
    const ticketId = await generateTicketId();

    const ticket = new SupportTicket({
      ticketId,
      userId: currentUser._id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      category: category || "Bug / Error",
      pageUrl: pageUrl || "Dashboard",
      subject,
      description,
      screenshotUrl: screenshotUrl || "",
      priority: priority || "Medium",
      status: "Open",
      messages: [
        {
          sender: "user",
          senderName: currentUser.name,
          senderRole: currentUser.role,
          text: description,
          attachments: screenshotUrl ? [screenshotUrl] : [],
        },
      ],
    });

    await ticket.save();

    // Notify IT admins of the new ticket in real-time
    getIO()?.to('it_admin_room').emit('new_ticket', ticket);

    return res.status(201).json({
      success: true,
      message: "Support ticket created successfully.",
      ticket,
    });
  } catch (error) {
    console.error("Error creating support ticket:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get or create General IT Inquiry Chat Thread
export const getOrCreateGeneralChat = async (req, res) => {
  try {
    console.log(`🔍 [getOrCreateGeneralChat] GET called — user: ${req.admin?.userId || req.user?.userId}`);
    const currentUser = await getUserContext(req);
    const role = (currentUser.role || "").toLowerCase();
    const isITSupportAdmin = ["it_admin", "super_admin", "admin"].includes(role);

    // Clean up any legacy automated greeting message from DB
    await SupportTicket.updateMany(
      { "messages.text": { $regex: "Welcome to IT Direct Support", $options: "i" } },
      { $pull: { messages: { text: { $regex: "Welcome to IT Direct Support", $options: "i" } } } }
    ).catch(() => {});

    // IT admins can view any user's direct chat thread by passing ?userId=...
    // They do NOT get their own thread created
    if (isITSupportAdmin) {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ success: false, message: "IT Admin must provide a userId query param to view a user's chat thread." });
      }
      const ticket = await SupportTicket.findOne({
        userId,
        category: "General IT Inquiry",
        status: { $ne: "Closed" },
      }).sort({ updatedAt: -1 });

      if (!ticket) {
        return res.status(404).json({ success: false, message: "No active direct chat found for this user." });
      }
      return res.status(200).json({ success: true, ticket });
    }

    // Regular users: find their own thread (GET — never creates, just looks up)
    const existing = await SupportTicket.findOne({
      userId: currentUser._id,
      category: "General IT Inquiry",
      status: { $ne: "Closed" },
    }).sort({ updatedAt: -1 });

    if (existing) {
      return res.status(200).json({ success: true, ticket: existing });
    }

    // GET should never auto-create — return 404 so the frontend shows empty state
    return res.status(404).json({ success: false, message: "No active direct chat found. Start a new chat to create one." });
  } catch (error) {
    console.error("Error getting general chat:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// In-memory lock to prevent duplicate concurrent chat creation for same user
const chatCreationInFlight = new Set();

// Create General IT Inquiry Chat Thread (POST only — explicit user action)
export const createGeneralChat = async (req, res) => {
  try {
    console.log(`🎫 [createGeneralChat] Called — method: ${req.method}, user: ${req.admin?.userId || req.user?.userId}`);
    console.trace('🎫 [createGeneralChat] Call stack:');
    const currentUser = await getUserContext(req);
    const role = (currentUser.role || "").toLowerCase();
    const isITSupportAdmin = ["it_admin", "super_admin", "admin"].includes(role);

    // IT admins don't get personal chat threads
    if (isITSupportAdmin) {
      return res.status(400).json({ success: false, message: "IT Admins do not have personal chat threads." });
    }

    const userId = String(currentUser._id);

    // Reject if another creation is already in-flight for this user
    if (chatCreationInFlight.has(userId)) {
      // Wait briefly and return whatever was created
      await new Promise((r) => setTimeout(r, 400));
      const existing = await SupportTicket.findOne({
        userId: currentUser._id,
        category: "General IT Inquiry",
        status: { $ne: "Closed" },
      }).sort({ updatedAt: -1 });
      if (existing) return res.status(200).json({ success: true, ticket: existing });
      return res.status(429).json({ success: false, message: "Creation already in progress." });
    }

    // Check if one already exists — don't duplicate
    const existing = await SupportTicket.findOne({
      userId: currentUser._id,
      category: "General IT Inquiry",
      status: { $ne: "Closed" },
    }).sort({ updatedAt: -1 });

    if (existing) {
      return res.status(200).json({ success: true, ticket: existing });
    }

    // Lock for this user
    chatCreationInFlight.add(userId);

    try {
      const ticketId = await generateTicketId();
      const ticket = new SupportTicket({
        ticketId,
        userId: currentUser._id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        userRole: currentUser.role,
        category: "General IT Inquiry",
        pageUrl: "General IT Chat",
        subject: `Direct Chat - ${currentUser.name || "User"}`,
        description: "Direct chat thread with IT Team for general site inquiries, clarification, images & voice notes.",
        priority: "Medium",
        status: "Open",
        messages: [],
      });
      await ticket.save();

      // Notify IT admins of the new chat thread
      getIO()?.to('it_admin_room').emit('new_ticket', ticket);

      return res.status(201).json({ success: true, ticket });
    } finally {
      chatCreationInFlight.delete(userId);
    }
  } catch (error) {
    console.error("Error creating general chat:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get tickets (All for IT Admin / Super Admin / Admin, user's own for regular users)
export const getTickets = async (req, res) => {
  try {
    const currentUser = await getUserContext(req);
    const role = (currentUser.role || "").toLowerCase();
    const isITSupportAdmin = ["it_admin", "super_admin", "admin"].includes(role);

    // Clean up any legacy automated greeting message from DB
    await SupportTicket.updateMany(
      { "messages.text": { $regex: "Welcome to IT Direct Support", $options: "i" } },
      { $pull: { messages: { text: { $regex: "Welcome to IT Direct Support", $options: "i" } } } }
    ).catch(() => {});

    let filter = {};
    if (!isITSupportAdmin) {
      filter.userId = currentUser._id;
    }

    const tickets = await SupportTicket.find(filter)
      .sort({ updatedAt: -1 })
      .populate("userId", "name email role")
      .populate("assignedTo", "name email");

    console.log(`📋 [getTickets] user="${currentUser.name}" role="${role}" found=${tickets.length} ticketIds=[${tickets.map(t => t.ticketId).join(', ')}]`);

    return res.status(200).json({
      success: true,
      tickets,
    });
  } catch (error) {
    console.error("Error fetching support tickets:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


// Get single ticket by ID
export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = await getUserContext(req);
    const role = (currentUser.role || "").toLowerCase();
    const isITSupportAdmin = ["it_admin", "super_admin", "admin"].includes(role);

    const ticket = await SupportTicket.findById(id)
      .populate("userId", "name email role")
      .populate("assignedTo", "name email");

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found." });
    }

    // Regular users can only view their own tickets
    if (!isITSupportAdmin && String(ticket.userId) !== String(currentUser._id)) {
      return res.status(403).json({ success: false, message: "Access denied. You can only view your own tickets." });
    }

    return res.status(200).json({ success: true, ticket });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Add a live chat reply message to ticket thread (supports text, image, audio voice notes)
export const addMessageToTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, attachments, audioUrl, mediaType } = req.body;

    if (!text && (!attachments || attachments.length === 0) && !audioUrl) {
      return res.status(400).json({ success: false, message: "Message content is required." });
    }

    const currentUser = await getUserContext(req);
    const role = (currentUser.role || "").toLowerCase();
    const isITSupportAdmin = ["it_admin", "super_admin", "admin"].includes(role);

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found." });
    }

    const isTicketOwner = String(ticket.userId) === String(currentUser._id);

    // Regular users can only message on their own tickets
    if (!isITSupportAdmin && !isTicketOwner) {
      return res.status(403).json({ success: false, message: "Access denied. You can only reply to your own tickets." });
    }

    // If sender is the ticket creator, they are "user"; if IT admin replying to another user's ticket, they are "it_admin"
    const sender = isTicketOwner ? "user" : "it_admin";
    const senderName = currentUser.name || (isTicketOwner ? "User" : "IT Support Admin");
    const senderRole = isTicketOwner ? (currentUser.role || "User") : "it_admin";

    const newMessage = {
      sender,
      senderName,
      senderRole,
      text: text || (audioUrl ? "🎤 Voice Note" : attachments?.length ? "📷 Image Attachment" : ""),
      attachments: attachments || [],
      audioUrl: audioUrl || "",
      mediaType: mediaType || (audioUrl ? "audio" : attachments?.length ? "image" : "text"),
      createdAt: new Date(),
    };

    ticket.messages.push(newMessage);
    
    // Automatically transition Open ticket to In Progress when IT admin replies
    if (!isTicketOwner && ticket.status === "Open") {
      ticket.status = "In Progress";
    }

    await ticket.save();

    // Broadcast the new message to everyone in this ticket's room (real-time)
    getIO()?.to(`ticket:${ticket._id}`).emit('new_message', { ticketId: ticket._id, ticket });
    // Also deliver directly to the ticket owner's personal room (catches users who haven't joined the ticket room yet)
    getIO()?.to(`user:${ticket.userId}`).emit('new_message', { ticketId: ticket._id, ticket });
    // Also notify IT admin room so the sidebar updates
    getIO()?.to('it_admin_room').emit('ticket_updated', ticket);

    return res.status(200).json({
      success: true,
      message: "Message added to support ticket.",
      ticket,
    });
  } catch (error) {
    console.error("Error adding message to ticket:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a ticket (IT Admin / super_admin only)
export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = await getUserContext(req);
    const role = (currentUser.role || "").toLowerCase();

    if (!["it_admin", "super_admin", "admin"].includes(role)) {
      return res.status(403).json({ success: false, message: "Access denied. Only IT Support Admins can delete tickets." });
    }

    const ticket = await SupportTicket.findByIdAndDelete(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found." });
    }

    // Notify all sockets watching this ticket that it was deleted
    getIO()?.to(`ticket:${ticket._id}`).emit('ticket_deleted', { ticketId: ticket._id });
    getIO()?.to('it_admin_room').emit('ticket_deleted', { ticketId: ticket._id });

    return res.status(200).json({ success: true, message: "Ticket deleted successfully." });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo } = req.body;

    const currentUser = await getUserContext(req);
    const role = (currentUser.role || "").toLowerCase();
    const isITSupportAdmin = ["it_admin", "super_admin", "admin"].includes(role);

    if (!isITSupportAdmin) {
      return res.status(403).json({ success: false, message: "Access denied. Only IT Support Admins can update ticket status." });
    }

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found." });
    }

    if (status) ticket.status = status;
    if (assignedTo) ticket.assignedTo = assignedTo;

    await ticket.save();

    // Notify the ticket owner and any IT admin watching in real-time
    getIO()?.to(`ticket:${ticket._id}`).emit('ticket_status_updated', { ticketId: ticket._id, status: ticket.status, ticket });
    getIO()?.to('it_admin_room').emit('ticket_updated', ticket);

    return res.status(200).json({
      success: true,
      message: `Ticket status updated to ${ticket.status}.`,
      ticket,
    });
  } catch (error) {
    console.error("Error updating ticket status:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
