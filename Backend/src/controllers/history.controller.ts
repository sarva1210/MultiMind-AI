import type { Request, Response } from "express";
import { ChatHistory } from "../models/ChatHistory.model.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export const getHistory = async (
  req: AuthenticatedRequest,
  res: Response
) => {};