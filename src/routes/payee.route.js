import express from "express";
import {
  newPayee,
  listPayee,
  showPayee,
  editPayee,
  removePayee,
} from "../controllers/payee.controller.js";
import { protectRoute, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * * PAYEE ROUTES
 * ACCESS ROLES: USER, STAFF, ADMIN
 */

/**
 * * ACCESS: STAFF AND ADMIN
 */
router.post("/newPayee", protectRoute, authorize(["STAFF", "ADMIN"]), newPayee);

router.get(
  "/listPayee",
  protectRoute,
  authorize(["STAFF", "ADMIN"]),
  listPayee
);
router.get(
  "/showPayee/:id",
  protectRoute,
  authorize(["STAFF", "ADMIN"]),
  showPayee
);

router.put(
  "/editPayee",
  protectRoute,
  authorize(["STAFF", "ADMIN"]),
  editPayee
);

export default router;
