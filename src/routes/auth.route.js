import express from "express";
import {
  signup,
  login,
  logout,
  showUsers,
  grantAdmin,
  checkAuth,
  resetPassword,
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

router.put("/resetPassword", protectRoute, resetPassword);
router.put("/grantAdmin/:id", protectRoute, authorize(["ADMIN"]), grantAdmin);

export default router;
