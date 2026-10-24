import mongoose from "mongoose";

const ChatHistorySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: false
    },
    battleId: {
        type: String,
        required: true,
        index: true
    },
    turnIndex: {
        type: Number,
        required: true,
        default: 0
    },
    problem: {
        type: String,
        required: true
    },
    solution_1: {
        type: String,
        required: true
    },
    solution_2: {
        type: String,
        required: true
    },
    judge_provider: {
        type: String,
        required: true
    }
});