import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import "dotenv/config";
import { connectDB } from "./db.js";

import hubRoutes from "./routes/hubRoutes.js";
import pathRoutes from "./routes/pathRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Routes
app.use("/api/hubs", hubRoutes);
app.use("/api/path", pathRoutes);

// 404 + error handler
app.use(notFound);
app.use(errorHandler);

// Start
const PORT = process.env.PORT || 5000;
await connectDB();
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
