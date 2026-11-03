import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export const streamBattle = async (
    req: AuthenticatedRequest,
    res: Response
) => {
};