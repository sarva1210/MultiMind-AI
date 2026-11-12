import { StateGraph, StateSchema, START, END, type GraphNode } from "@langchain/langgraph";

import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { z } from "zod";

import {
    cohereModel,
    geminiModel,
    groqModel,
} from "./model.ai.js";

// Graph state
const state = new StateSchema({
    problem: z.string().default(""),
    solution_1: z.string().default(""),
    solution_2: z.string().default(""),
    judge_provider: z.string().default("gemini"),

    judge: z.object({
        solution_1_score: z.number(),
        solution_2_score: z.number(),
        solution_1_reasoning: z.string(),
        solution_2_reasoning: z.string(),
    }).optional(),
});

// Judge output schema
const judgeSchema = z.object({
    solution_1_score: z.number().min(0).max(10),
    solution_2_score: z.number().min(0).max(10),
    solution_1_reasoning: z.string(),
    solution_2_reasoning: z.string(),
});

// Generate Groq and Cohere responses in parallel
const solutionNode: GraphNode<typeof state> = async (state) => {
    console.log("Generating solutions...");

    const [groqResponse, cohereResponse] = await Promise.all([
        groqModel.invoke(state.problem),
        cohereModel.invoke(state.problem),
    ]);

    const solution1 = groqResponse.content;
    const solution2 = cohereResponse.content;

    if (
        typeof solution1 !== "string" ||
        typeof solution2 !== "string"
    ) {
        throw new Error("AI models returned invalid responses");
    }

    console.log("Groq response generated");
    console.log("Cohere response generated");

    return {
        solution_1: solution1,
        solution_2: solution2,
    };
};

// Judge node
const judgeNode: GraphNode<typeof state> = async (state) => {
    console.log("Judge evaluation started...");

    const {
        problem,
        solution_1,
        solution_2,
        judge_provider,
    } = state;

    let judgeModel: BaseChatModel = geminiModel;

    if (judge_provider === "groq") {
        judgeModel = groqModel;
    } else if (judge_provider === "cohere") {
        judgeModel = cohereModel;
    }

    console.log("Selected judge:", judge_provider);

    const prompt = ` You are an impartial AI judge.
    Evaluate the following two AI-generated solutions.

    Problem:
    ${problem}

    Solution 1 (Groq):
    ${solution_1}

    Solution 2 (Cohere):
    ${solution_2}

    Evaluate both solutions based on:
    1. Accuracy
    2. Relevance
    3. Clarity
    4. Completeness
    5. Correctness

    Give each solution a score between 0 and 10.

    Return ONLY valid JSON in this exact format:
{
    "solution_1_score": 8,
    "solution_2_score": 9,
    "solution_1_reasoning": "Explanation of solution 1 score",
    "solution_2_reasoning": "Explanation of solution 2 score"
}

Do not include markdown or code fences.
`;

    try {
        console.log("Calling judge API...");

        const response = await judgeModel.invoke(prompt);

        console.log("Judge API returned!");

        const content = response.content;

        const responseText = typeof content === "string"
            ? content
            : Array.isArray(content)
                ? content
                    .filter((part) => part.type === "text")
                    .map((part) => part.text)
                    .join("\n")
                : "";

        if (!responseText) {
            throw new Error("Judge returned an empty response");
        }

        // Remove markdown code fences if present
        const cleanedResponse = responseText
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

        const parsedResponse = JSON.parse(cleanedResponse);

        const validatedJudge = judgeSchema.parse(parsedResponse);

        console.log("Judge evaluation completed:", validatedJudge);

        return {
            judge: validatedJudge,
        };

    } catch (error) {
        console.error("Judge API failed:", error);
        throw error;
    }
};

// Build LangGraph
const graph = new StateGraph(state)
    .addNode("solution", solutionNode)
    .addNode("judge_node", judgeNode)
    .addEdge(START, "solution")
    .addEdge("solution", "judge_node")
    .addEdge("judge_node", END)
    .compile();

// Run graph
export default async function (
    problem: string,
    judge_provider: string = "gemini"
) {
    return graph.streamEvents(
        {
            problem,
            judge_provider,
        },
        {
            version: "v2",
        }
    );
}