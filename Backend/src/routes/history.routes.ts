import { Router } from "express";
import { getHistory, saveHistory, deleteBattle } from "../controllers/history.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// Get user's battle history
router.get("/", authMiddleware, getHistory);

// Save battle history
router.post("/", authMiddleware, saveHistory);

// Delete complete battle
router.delete("/:battleId", authMiddleware, deleteBattle);

export default router;