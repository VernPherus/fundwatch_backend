import express from "express";
import {
  newPayee,
  listPayee,
  showPayee,
  editPayee,
  removePayee,
} from "../controllers/payee.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * * PAYEE ROUTES
 */
router.post("/newPayee", protectRoute, newPayee);

router.get("/listPayee", protectRoute, listPayee);
router.get("/showPayee/:id", protectRoute, showPayee);

router.put("/editPayee", protectedRoute, editPayee);

export default router;
