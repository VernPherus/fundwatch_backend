import express from "express";
import { getSystemLogs } from "../controllers/log.controller.js";
import { protectRoute, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * * LOG ROUTES
 */

router.get("/", protectRoute, authorize(["ADMIN"]), getSystemLogs);

export default router;
