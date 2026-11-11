import { ChatGoogle } from "@langchain/google";
import { ChatGroq } from "@langchain/groq";
import { ChatCohere } from "@langchain/cohere";
import config from "../config/config.js";

// Gemini
export const geminiModel = new ChatGoogle({
    model: "gemini-3.8-flash",
    temperature: 0.7,
    apiKey: config.GOOGLE_API_KEY,
});

// Groq
export const groqModel = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0.7,
    apiKey: config.GROQ_API_KEY,
});

// Cohere
export const cohereModel = new ChatCohere({
    model: "command-a-03-2025",
    apiKey: config.COHERE_API_KEY,
});