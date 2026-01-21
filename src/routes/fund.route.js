import express from "express";
import {
  newFund,
  newEntry,
  displayFund,
  displayFundDashboard,
  displayEntry,
  showFund,
  editFund,
  deactivateFund,
  resetFund,
  deleteEntry,
} from "../controllers/fund.controller.js";
import { protectRoute, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * * FUND ROUTES
 */
router.post("/newfund", protectRoute, authorize(["STAFF", "ADMIN"]), newFund);
router.post("/newEntry", protectRoute, authorize(["STAFF", "ADMIN"]), newEntry);

router.get(
  "/displayfund",
  protectRoute,
  authorize(["STAFF", "ADMIN", "USER"]),
  displayFund,
);
router.get(
  "/showfund",
  protectRoute,
  authorize(["USER", "STAFF", "ADMIN"]),
  showFund,
);
router.get(
  "/displayDashboard",
  protectRoute,
  authorize(["USER", "STAFF", "ADMIN"]),
  displayFundDashboard,
);
router.get(
  "/displayEntry",
  protectRoute,
  authorize(["USER", "STAFF", "ADMIN"]),
  displayEntry,
);

router.put(
  "/editfund/:id",
  protectRoute,
  authorize(["STAFF", "ADMIN"]),
  editFund,
);

router.put("/reset", protectRoute, resetFund);
router.put(
  "/deactivatefund/:id",
  protectRoute,
  authorize(["STAFF", "ADMIN"]),
  deactivateFund,
);
router.put("/deleteEntry", authorize(["STAFF", "AUTHORIZE"], deleteEntry));

export default router;
