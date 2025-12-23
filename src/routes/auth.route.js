import express from "express";
import {
  signup,
  login,
  logout,
  showUsers,
} from "../controllers/auth.controller.js";

const router = express.Router();

/**
 ** User authentication routes
 */

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/showUsers", showUsers);

export default router;
