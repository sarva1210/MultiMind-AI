import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export const streamBattle = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    res.write(`data: ${JSON.stringify({ type: "start" })}\n\n`);

    const { problem, battleId } = req.body;
    if (!problem || !battleId) {

        return res.end();
    }
};