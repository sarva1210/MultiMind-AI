import { StateGraph, StateSchema, START, END, type GraphNode } from "@langchain/langgraph";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { z } from "zod";
import { cohereModel, geminiModel, groqModel } from "./model.ai.js";

const judgeSchema = z.object({
    solution_1_score: z.number().min(0).max(10),
    solution_2_score: z.number().min(0).max(10),
    solution_1_reasoning: z.string(),
    solution_2_reasoning: z.string(),
});

const state = new StateSchema({
    problem: z.string().default(""),
    solution_1: z.string().default(""),
    solution_2: z.string().default(""),
    judge_provider: z.string().default("gemini"),
    judge: judgeSchema.optional(),
});

const solutionNode: GraphNode<typeof state> = async ({ problem }) => {
    const [groq, cohere] = await Promise.all([
        groqModel.invoke(problem),
        cohereModel.invoke(problem),
    ]);

    if (typeof groq.content !== "string" || typeof cohere.content !== "string") {
        throw new Error("AI models returned invalid responses");
    }

    return {
        solution_1: groq.content,
        solution_2: cohere.content,
    };
};

const judgeModels: Record<string, BaseChatModel> = {
    gemini: geminiModel,
    groq: groqModel,
    cohere: cohereModel,
};

const judgeNode: GraphNode<typeof state> = async ({
    problem,
    solution_1,
    solution_2,
    judge_provider,
}) => {
    const judgeModel = judgeModels[judge_provider] ?? geminiModel;

    const prompt = `
You are a strict, independent and unbiased AI evaluator.

Evaluate both answers independently. Do not favor any model, writing style,
answer length or formatting. Award points only for demonstrated quality.
Penalize incorrect facts, irrelevant content, missing steps and unsupported claims.
Do not use predetermined scores or artificially create a winner.
Equal scores are acceptable when both answers are equally good.

PROBLEM:
${problem}

SOLUTION 1 (GROQ):
${solution_1}

SOLUTION 2 (COHERE):
${solution_2}

SCORING RUBRIC (TOTAL: 10 POINTS):
1. Accuracy and correctness: 0-4
2. Relevance: 0-2
3. Completeness: 0-2
4. Clarity: 0-1
5. Practical usefulness: 0-1

Calculate scores using all five criteria. Use decimals when appropriate.
Give separate, specific reasoning based on actual strengths and weaknesses.

Return ONLY valid JSON with exactly these four keys:
{
    "solution_1_score": 0.0,
    "solution_2_score": 0.0,
    "solution_1_reasoning": "Specific evaluation of solution 1",
    "solution_2_reasoning": "Specific evaluation of solution 2"
}
Do not include Markdown or code fences.
`;

    const response = await judgeModel.invoke(prompt);
    const content = response.content;

    const responseText = typeof content === "string"
        ? content
        : Array.isArray(content)
            ? content
                .filter((part) => part.type === "text")
                .map((part) => part.text)
                .join("\n")
            : "";

    if (!responseText) throw new Error("Judge returned an empty response");

    const result = JSON.parse(
        responseText.replace(/```json|```/gi, "").trim()
    );

    return { judge: judgeSchema.parse(result) };
};

const graph = new StateGraph(state)
    .addNode("solution", solutionNode)
    .addNode("judge_node", judgeNode)
    .addEdge(START, "solution")
    .addEdge("solution", "judge_node")
    .addEdge("judge_node", END)
    .compile();

export default async function (
    problem: string,
    judge_provider: string = "gemini"
) {
    return graph.streamEvents(
        { problem, judge_provider },
        { version: "v2" }
    );
}