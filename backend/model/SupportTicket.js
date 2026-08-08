import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: String, enum: ["user", "it_admin"], required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, default: "" },
    text: { type: String, default: "" },
    attachments: [{ type: String }],
    audioUrl: { type: String, default: "" },
    mediaType: { type: String, enum: ["text", "image", "audio"], default: "text" },
  },
  { timestamps: true }
);

const supportTicketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, unique: true, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    userRole: { type: String, required: true },
    category: {
      type: String,
      enum: ["Bug / Error", "UI Layout Issue", "Feature Request", "Performance / Lag", "General IT Inquiry", "Other"],
      default: "General IT Inquiry",
    },
    pageUrl: { type: String, default: "General Site" },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    screenshotUrl: { type: String, default: "" },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
    messages: [messageSchema],
  },
  { timestamps: true }
);

supportTicketSchema.index({ userId: 1, status: 1 });
supportTicketSchema.index({ createdAt: -1 });

const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);

export default SupportTicket;
