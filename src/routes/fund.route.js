import express from "express";
import{newFund} from "../controllers/fund.controller.js";
import{displayFund} from "../controllers/fund.controller.js";
import { showFund } from "../controllers/fund.controller.js";
import { editFund } from "../controllers/fund.controller.js";
import { deactivateFund } from "../controllers/fund.controller.js";

const router = express.Router();

/**
 * * FUND ROUTES
 */
router.get("/newfund",newFund);
router.get("/displayfund", displayFund);
router.get("/showfund", showFund);
router.get("/editfund", editFund);
router.get("/deactivatefund", deactivateFund);
export default router;