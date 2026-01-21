import express from "express";
import { protectRoute, authorize } from "../middleware/auth.middleware.js";
import { generateSPV } from "../controllers/report.controller.js";

const router = express.Router();

// Allow STAFF and ADMIN to generate reports
router.get("/spv", protectRoute, authorize(["STAFF", "ADMIN"]), generateSPV);

export default router;
