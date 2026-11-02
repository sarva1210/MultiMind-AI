import type { Request, Response } from "express";
import { ChatHistory } from "../models/ChatHistory.model.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export const getHistory = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({
            error: "Unauthorized"
        });
    }

    const history = await ChatHistory.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
        history
    });
};

export const saveHistory = async (
    req: AuthenticatedRequest,
    res: Response
) => {

};