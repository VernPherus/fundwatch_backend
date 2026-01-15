import express from "express";
import {
  storeRec,
  displayRec,
  showRec,
  editRec,
  approveRec,
} from "../controllers/disbursement.controller.js";
import { protectRoute, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * * DISBURSEMENT ROUTES
 * ACCESS ROLES: USER, STAFF, ADMIN
 */

/**
 * * ACCESS: ALL
 */
router.get(
  "/display",
  protectRoute,
  authorize(["USER", "STAFF", "ADMIN"]),
  displayRec
);
router.get(
  "/show/:id",
  protectRoute,
  authorize(["USER", "STAFF", "ADMIN"]),
  showRec
);

/**
 * * ACCESS: ADMIN AND STAFF ONLY
 */
router.post("/store", protectRoute, authorize(["STAFF", "ADMIN"]), storeRec);

router.put(
  "/editRec/:id",
  protectRoute,
  authorize(["STAFF", "ADMIN"]),
  editRec
);
router.put(
  "/approve/:id",
  protectRoute,
  authorize(["STAFF", "ADMIN"]),
  approveRec
);

export default router;
