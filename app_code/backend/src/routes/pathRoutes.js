import { Router } from "express";
import { shortestPath } from "../controllers/pathController.js";

const router = Router();

// GET /api/path?source=A&destination=D
router.get("/", shortestPath);

export default router;
