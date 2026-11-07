import { Router } from "express";
import { streamBattleTurn } from "../controllers/stream.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

export default router;
