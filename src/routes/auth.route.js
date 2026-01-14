import express from "express";
import {
  signup,
  login,
  logout,
  showUsers,
  grantAdmin,
} from "../controllers/auth.controller.js";
import { protectRoute, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * * AUTHENTICATION ROUTES
 * ACCESS ROLES: USER, STAFF, ADMIN
 */

/**
 * * ACCESS: ALL
 */
router.post("/login", login);
router.post("/logout", logout);


/**
 * * ACCESS: ADMIN ONLY
 */
router.post("/signup", signup);

router.get("/showUsers", protectRoute, authorize(["ADMIN"]), showUsers);

router.put("/grantAdmin", protectRoute, authorize(["ADMIN"]), grantAdmin);

export default router;
