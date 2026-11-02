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
    const userId = req.user?.id;
    
    const { battleId, turnIndex, problem, solution_1, solution_2, judge_provider, judge } = req.body;

    if (!userId || !battleId || !problem || !solution_1 || !solution_2 || !judge) {
        return res.status(400).json({
            error: "Required battle data is missing"
        });
    }
};