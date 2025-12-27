import express from "express";
import {
  signup,
  login,
  logout,
  showUsers,
  grantAdmin,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 ** User authentication routes
 */

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.get("/showUsers", protectRoute, showUsers);
router.put("/grantAdmin", protectRoute, grantAdmin);

export default router;
