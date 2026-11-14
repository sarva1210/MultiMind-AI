import type { Response } from "express";
import runGraph from "../ai/graph.ai.js";
import { ChatHistory } from "../models/ChatHistory.model.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export const streamBattleTurn = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const { input, judge_provider, battleId, turnIndex } = req.body;
    const userId = req.user?.id;

    // Validate request
    if (!userId) {
        return res.status(401).json({
            error: "Unauthorized"
        });
    }

    if (
        typeof input !== "string" ||
        !input.trim() ||
        typeof battleId !== "string" ||
        !battleId.trim()
    ) {
        return res.status(400).json({
            error: "Input and battleId are required"
        });
    }

    if (
        judge_provider &&
        !["gemini", "groq", "cohere"].includes(judge_provider)
    ) {
        return res.status(400).json({
            error: "Invalid judge provider"
        });
    }

    if (
        turnIndex !== undefined &&
        (!Number.isInteger(turnIndex) || turnIndex < 0)
    ) {
        return res.status(400).json({
            error: "Invalid turnIndex"
        });
    }

    // SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    let solution1 = "";
    let solution2 = "";
    let judgeResult: any = null;
    let clientDisconnected = false;

    res.on("close", () => {
        clientDisconnected = true;
    });

    const sendEvent = (data: unknown) => {
        if (!clientDisconnected && !res.writableEnded) {
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        }
    };

    try {
        sendEvent({ type: "start" });

        const stream = await runGraph(
            input,
            judge_provider || "gemini"
        );

        for await (const event of stream) {
            if (clientDisconnected) break;

            if (event.event === "on_chain_end") {
                const output = event.data?.output;

                if (output?.solution_1) {
                    solution1 = output.solution_1;
                    solution2 = output.solution_2;
                }

                if (output?.judge) {
                    judgeResult = output.judge;
                }
            }

            sendEvent(event);
        }

        if (clientDisconnected) return;

        if (!solution1 || !solution2) {
            throw new Error("AI solutions were not generated");
        }

        // Save completed battle to MongoDB
        const savedHistory = await ChatHistory.create({
            userId,
            battleId,
            turnIndex: turnIndex ?? 0,
            problem: input,
            solution_1: solution1,
            solution_2: solution2,
            judge_provider: judge_provider || "gemini",
            judge: judgeResult || {
                solution_1_score: 0,
                solution_2_score: 0,
                solution_1_reasoning: "Judge result unavailable",
                solution_2_reasoning: "Judge result unavailable"
            }
        });

        sendEvent({
            type: "complete",
            historyId: String(savedHistory._id)
        });

    } catch (error) {
        console.error("Stream error:", error);

        sendEvent({
            type: "error",
            message: error instanceof Error
                ? error.message
                : "Something went wrong"
        });
    } finally {
        if (!res.writableEnded) {
            res.end();
        }
    }
};