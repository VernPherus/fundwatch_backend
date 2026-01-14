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
 */
router.post("/newfund", protectRoute, newFund);

router.get("/displayfund", protectRoute, displayFund);
router.get("/showfund", protectRoute, showFund);

router.put("/editfund", protectRoute, editFund);
//router.put("/deactivatefund", deactivateFund);

export default router;
