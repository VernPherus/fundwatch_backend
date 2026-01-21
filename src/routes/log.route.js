import express from "express";
import { getSystemLogs } from "../controllers/log.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * * LOG ROUTES
 */

router.get('/', protectRoute, getSystemLogs);

export default router;
