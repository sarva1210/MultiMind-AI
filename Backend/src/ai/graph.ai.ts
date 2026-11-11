import { StateGraph, StateSchema, START, END, type GraphNode } from "@langchain/langgraph";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { z } from "zod";

import {
    cohereModel,
    geminiModel,
    groqModel,
} from "./model.ai.js";

import {
    createAgent,
    HumanMessage,
    providerStrategy,
} from "langchain";

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

// Generate Groq and Cohere responses
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

// Evaluate both responses
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
    console.log("Creating judge agent...");

    const judge = createAgent({
        model: judgeModel,
        responseFormat: providerStrategy(judgeSchema),

        systemPrompt: `
            You are an impartial AI judge.

            Evaluate both AI-generated solutions based on:
            - Accuracy
            - Relevance
            - Clarity
            - Completeness
            - Correctness

            Give each solution a score between 0 and 10.
            Provide separate reasoning for both scores.
            Be fair and objective.
        `,
    });

    console.log("Calling Gemini/Judge API...");

    try {
        const judgeResponse = await judge.invoke({
            messages: [
                new HumanMessage(`
                    Problem:
                    ${problem}

                    Solution 1 (Groq):
                    ${solution_1}

                    Solution 2 (Cohere):
                    ${solution_2}

                    Evaluate both solutions and provide scores
                    and reasoning in the required structured format.
                `),
            ],
        });

        console.log("Gemini/Judge API returned!");
        console.log("Complete judge response:", judgeResponse);

        const structuredResponse = judgeResponse.structuredResponse;

        console.log("Structured judge response:", structuredResponse);

        if (!structuredResponse) {
            throw new Error("Judge returned no structured response");
        }

        const validatedJudge = judgeSchema.parse(structuredResponse);

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
    const stream = graph.streamEvents(
        {
            problem,
            judge_provider,
        },
        {
            version: "v2",
        }
    );

    return stream;
}