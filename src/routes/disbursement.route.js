import express from "express";
import {
  storeRec,
  displayRec,
  showRec,
  editRec,
  approveRec,
} from "../controllers/disbursement.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * * DISBURSEMENT ROUTES
 */
router.get("/display", protectRoute, displayRec);
router.get("/show/:id", protectRoute, showRec);

router.post("/store", protectRoute, storeRec);

router.put("/editRec/:id", protectRoute, editRec);
router.put("/approve/:id", protectRoute, approveRec);

export default router;

