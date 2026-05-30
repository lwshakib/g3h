import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import {
  createWorkflow,
  deleteWorkflow,
  executeWorkflow,
  executeWorkflowStream,
  getWorkflowById,
  listWorkflows,
  updateWorkflow,
} from "../controllers/workflow.controllers.js";

const router: Router = Router();

router.post("/", authMiddleware, createWorkflow);

router.get("/", authMiddleware, listWorkflows);
router.get("/:id", authMiddleware, getWorkflowById);
router.get("/:id/execute/stream", executeWorkflowStream);
router.patch("/:id", authMiddleware, updateWorkflow);
router.post("/:id/execute", authMiddleware, executeWorkflow);
router.delete("/:id", authMiddleware, deleteWorkflow);

export default router;
