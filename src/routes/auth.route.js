import express from "express";
import {
  signup,
  login,
  logout,
  showUsers,
  grantAdmin,
  checkAuth,
} from "../controllers/auth.controller.js";
import { protectRoute, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * * AUTHENTICATION ROUTES
 */

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.get("/check", protectRoute, checkAuth);

router.get("/showUsers", protectRoute, authorize(["ADMIN"]), showUsers);
router.put("/grantAdmin", protectRoute, authorize(["ADMIN"]), grantAdmin);

export default router;

