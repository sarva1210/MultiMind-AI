import express from "express"
import cors from "cors"
import authRoutes from "./routes/auth.routes.js";

const app = express();
app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173"
}));

app.get("/healthz", (_req, res) => {
  res.json({ status: "app is running" });
});

export default app 