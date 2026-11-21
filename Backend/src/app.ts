import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import historyRoutes from "./routes/history.routes.js";
import streamRoutes from "./routes/stream.routes.js";

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.get("/healthz", (_req, res) => {
    res.json({ status: "app is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/stream", streamRoutes);

export default app;