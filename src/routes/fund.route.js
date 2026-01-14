import express from "express";
import {
  newFund,
  displayFund,
  showFund,
  editFund,
  deactivateFund,
} from "../controllers/fund.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * * FUND ROUTES
 * ACCESS ROLES: USER, STAFF, ADMIN
 */

/**
 * * ACCESS: STAFF AND ADMIN
 */
router.post("/newfund", protectRoute, newFund);

/**
 * * ACCESS: ALL
 */
router.get("/displayfund", protectRoute, displayFund);
router.get("/showfund", protectRoute, showFund);

/**
 * * ACCESS: STAFF AND ADMIN
 */
router.put("/editfund", protectRoute, editFund);
//router.put("/deactivatefund", deactivateFund);

export default router;
