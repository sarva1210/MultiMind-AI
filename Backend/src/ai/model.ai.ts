import { ChatGoogle } from "@langchain/google";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatCohere } from "@langchain/cohere";
import config from "../config/config.js";

// google
export const geminiModel = new ChatGoogle({
    model: "gemini-2.5-flash",
    temperature: 0.7,
    apiKey: config.GOOGLE_API_KEY,
})

// mistral
export const mistralAIModel = new ChatMistralAI({
    model: "mistral-small-latest",
    temperature: 0.7,
    apiKey: config.MISTRAL_API_KEY,
});

// cohore
export const cohereModel = new ChatCohere({
    model: "command-a-03-2025",
    apiKey: config.COHERE_API_KEY,
})