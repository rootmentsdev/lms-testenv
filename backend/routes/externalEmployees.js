import express from "express";
import axios from "axios";

const router = express.Router();

/**
 * POST /api/employee_range
 * Proxies to https://rootments.in/api/employee_range
 * Body: { startEmpId, endEmpId }
 */
router.post("/employee_range", async (req, res) => {
  try {
    const { startEmpId = "EMP1", endEmpId = "EMP9999" } = req.body || {};
    console.log("➡️  /api/employee_range proxy hit:", { startEmpId, endEmpId });

    const upstream = "https://rootments.in/api/employee_range";
    const { data } = await axios.post(
      upstream,
      { startEmpId, endEmpId },
      { timeout: 15000 }
    );

    // The upstream returns { status: "success", data: [...] }
    return res.status(200).json(data);
  } catch (err) {
    const status = err?.response?.status || 500;
    const payload = err?.response?.data || { message: err.message || "Proxy failed" };
    console.error("❌ /api/employee_range upstream error:", status, payload);
    return res.status(status).json(payload);
  }
});

export default router;
