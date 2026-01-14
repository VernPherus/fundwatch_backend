import express from "express";
import { getSystemLogs } from "../controllers/log.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * * LOG ROUTES
 * ACCESS ROLES: USER, STAFF, ADMIN
 */

/**
 * * ACCESS: ADMIN 
 */

router.get('/get', protectRoute, getSystemLogs);

export default router;
