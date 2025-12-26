import express from "express";
import {
  signup,
  login,
  logout,
  showUsers,
  grantAdmin,
} from "../controllers/auth.controller.js";

const router = express.Router();

/**
 ** User authentication routes
 */

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/showUsers", showUsers);
router.put("/grantAdmin", grantAdmin);

export default router;
