import { Router } from "express";
import { getHistory, saveHistory } from "../controllers/history.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();