import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { createWorkflow, listWorkflows } from "../controllers/workflow.controllers.js";

const router: Router = Router();

router.post("/", authMiddleware, createWorkflow);

router.get("/", authMiddleware, listWorkflows);

export default router;
