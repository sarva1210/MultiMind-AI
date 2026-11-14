import { StateGraph, StateSchema, START, END, type GraphNode } from "@langchain/langgraph";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { z } from "zod";
import { cohereModel, geminiModel, groqModel } from "./model.ai.js";

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

    const prompt = `
You are a strict, independent and unbiased AI evaluator.

Your task is to evaluate two AI-generated answers to the same problem.

IMPORTANT RULES:
- Evaluate each answer independently before comparing them.
- Never assume that either answer is correct.
- Do not favor a model, writing style, answer length, or formatting.
- Do not give similar scores automatically.
- Do not use default or predetermined scores.
- Award points only for demonstrated quality.
- Penalize incorrect facts, irrelevant content, missing steps,
  unsupported claims and misleading explanations.
- A longer answer is not automatically a better answer.
- If both answers are equally good, equal scores are acceptable.
- Be strict and justify every score using evidence from the answers.

PROBLEM:
${problem}

SOLUTION 1 (GROQ):
${solution_1}

SOLUTION 2 (COHERE):
${solution_2}

SCORING RUBRIC (TOTAL: 10 POINTS):

1. Accuracy and correctness: 0-4 points
   Are the facts, concepts and explanations correct?

2. Relevance: 0-2 points
   Does the answer directly address the problem?

3. Completeness: 0-2 points
   Does it cover the important requirements and details?

4. Clarity: 0-1 point
   Is it understandable and well organized?

5. Practical usefulness: 0-1 point
   Are examples, steps or recommendations useful when appropriate?

SCORING INSTRUCTIONS:
- Calculate the total score using the five criteria.
- Use decimal scores when appropriate.
- Do not round every answer to 8 or 9.
- A weak or incorrect answer should receive a genuinely low score.
- An excellent answer should receive a high score.
- Do not artificially create a winner.
- Give separate, specific reasoning for both answers.
- Explain actual strengths and weaknesses, not generic statements.

OUTPUT REQUIREMENTS:
Return ONLY valid JSON.
Do not include Markdown or code fences.
Do not include any text outside the JSON object.

Use exactly these four keys:
{
    "solution_1_score": 0.0,
    "solution_2_score": 0.0,
    "solution_1_reasoning": "Specific evaluation of solution 1",
    "solution_2_reasoning": "Specific evaluation of solution 2"
}
`;

    try {
        console.log("Calling judge API...");

        const response = await judgeModel.invoke(prompt);

        console.log("Judge API returned!");

        const content = response.content;

        const responseText =
            typeof content === "string"
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