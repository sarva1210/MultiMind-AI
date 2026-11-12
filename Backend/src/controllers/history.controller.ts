import type { Response } from "express";
import { ChatHistory } from "../models/ChatHistory.model.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

// Get all history
export const getHistory = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }

        const history = await ChatHistory.find({ userId })
            .sort({ createdAt: -1 });

        return res.status(200).json({ history });

    } catch (error) {
        console.error("Get history error:", error);

        return res.status(500).json({
            error: "Failed to fetch chat history"
        });
    }
};

// Save battle history
export const saveHistory = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const userId = req.user?.id;

        const {
            battleId,
            turnIndex,
            problem,
            solution_1,
            solution_2,
            judge_provider,
            judge
        } = req.body;

        if (
            !userId ||
            !battleId ||
            !Number.isInteger(turnIndex) ||
            turnIndex < 0 ||
            !problem ||
            !solution_1 ||
            !solution_2 ||
            !judge_provider ||
            !judge
        ) {
            return res.status(400).json({
                error: "Required battle data is missing or invalid"
            });
        }

        const newHistory = await ChatHistory.create({
            userId,
            battleId,
            turnIndex,
            problem,
            solution_1,
            solution_2,
            judge_provider,
            judge
        });

        return res.status(201).json({
            message: "Battle history saved successfully",
            history: newHistory
        });

    } catch (error) {
        console.error("Save history error:", error);

        return res.status(500).json({
            error: "Failed to save battle history"
        });
    }
};

// Delete complete battle history
export const deleteBattle = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const userId = req.user?.id;
        const { battleId } = req.params;

        if (!userId) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }

        if (!battleId) {
            return res.status(400).json({
                error: "Battle ID is required"
            });
        }

        const result = await ChatHistory.deleteMany({
            userId,
            battleId
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                error: "Battle history not found"
            });
        }

        return res.status(200).json({
            message: "Battle history deleted successfully",
            deletedCount: result.deletedCount
        });

    } catch (error) {
        console.error("Delete history error:", error);

        return res.status(500).json({
            error: "Failed to delete battle history"
        });
    }
};