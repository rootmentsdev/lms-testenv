import express from "express";
import { savePerformance, getMyRating, getStaffResults } from "../controllers/PerformanceController.js";
import { MiddilWare } from "../lib/middilWare.js";

const router = express.Router();

router.post("/save", MiddilWare, savePerformance);
router.get("/my-rating", MiddilWare, getMyRating);
router.get("/staff-results", MiddilWare, getStaffResults);

export default router;
