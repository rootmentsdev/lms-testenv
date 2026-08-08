import express from "express";
import { MiddilWare } from "../lib/middilWare.js";
import {
  createTicket,
  getTickets,
  getTicketById,
  addMessageToTicket,
  updateTicketStatus,
  deleteTicket,
  getOrCreateGeneralChat,
  createGeneralChat,
} from "../controllers/SupportTicketController.js";

const router = express.Router();

// General IT Inquiry direct chat thread routes
// GET  — read-only lookup, never creates
// POST — explicit user action, creates if none exists
router.get("/general-chat", MiddilWare, getOrCreateGeneralChat);
router.post("/general-chat", MiddilWare, createGeneralChat);

// Standard support ticket routes
router.post("/", MiddilWare, createTicket);
router.get("/", MiddilWare, getTickets);
router.get("/:id", MiddilWare, getTicketById);
router.post("/:id/messages", MiddilWare, addMessageToTicket);
router.patch("/:id/status", MiddilWare, updateTicketStatus);
router.delete("/:id", MiddilWare, deleteTicket);

export default router;
