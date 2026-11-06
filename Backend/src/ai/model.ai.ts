import { ChatGoogle } from "@langchain/google";
import { ChatGroq } from "@langchain/groq"
import { ChatCohere } from "@langchain/cohere";
import config from "../config/config.js";

export const mistralAIModel = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0.7,
    apiKey: config.MISTRAL_API_KEY,
})