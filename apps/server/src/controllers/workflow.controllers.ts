import { Request, Response } from "express";
import { postgresService } from "../services/postgres.services.js";
import logger from "../logger/winston.logger.js";

type WorkflowNode = {
  id: string;
  type?: string;
  data?: {
    label?: string;
    method?: string;
    url?: string;
    inputSample?: string;
  };
};

type WorkflowEdge = {
  source: string;
  target: string;
};

type WorkflowRunStatus = {
  nodeId: string;
  label: string;
  status: "running" | "success" | "error" | "skipped";
  message?: string;
  statusCode?: number;
  output?: string;
};

const runWorkflowSequence = async (
  workflow: any,
  onStatus?: (status: WorkflowRunStatus) => void
) => {
  const data = (workflow.data || {}) as { nodes?: WorkflowNode[]; edges?: WorkflowEdge[] };
  const nodes = data.nodes || [];
  const edges = data.edges || [];

  const manualTrigger = nodes.find(
    (node) => node.type === "manualTrigger" || node.type === "manual-trigger"
  );
  if (!manualTrigger) {
    const missingTriggerStatus: WorkflowRunStatus = {
      nodeId: "manual-trigger",
      label: "Manual Trigger",
      status: "error",
      message: "Manual trigger not found in workflow",
    };
    onStatus?.(missingTriggerStatus);
    return [missingTriggerStatus];
  }

  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const outgoing = new Map<string, WorkflowEdge[]>();
  for (const edge of edges) {
    const list = outgoing.get(edge.source) ?? [];
    list.push(edge);
    outgoing.set(edge.source, list);
  }

  const statuses: WorkflowRunStatus[] = [];
  const emit = (status: WorkflowRunStatus) => {
    statuses.push(status);
    onStatus?.(status);
  };

  const visited = new Set<string>();
  const queued = new Set<string>([manualTrigger.id]);
  const queue: string[] = [manualTrigger.id];

  while (queue.length > 0) {
    const currentNodeId = queue.shift();
    if (!currentNodeId || visited.has(currentNodeId)) continue;
    visited.add(currentNodeId);

    const node = nodeById.get(currentNodeId);
    if (!node) continue;

    let canContinueBranch = true;

    if (node.type === "manualTrigger" || node.type === "manual-trigger") {
      emit({
        nodeId: node.id,
        label: node.data?.label || "Manual Trigger",
        status: "running",
        message: "Starting execution",
      });
      emit({
        nodeId: node.id,
        label: node.data?.label || "Manual Trigger",
        status: "success",
        message: "Triggered manually",
      });
    } else if (node.type === "httpRequest" || node.type === "http-request") {
      const method = (node.data?.method || "GET").toUpperCase();
      const url = node.data?.url;
      const payload = node.data?.inputSample;

      if (!url) {
        emit({
          nodeId: node.id,
          label: node.data?.label || "HTTP Request",
          status: "error",
          message: "Missing URL",
        });
        canContinueBranch = false;
      } else {
        emit({
          nodeId: node.id,
          label: node.data?.label || "HTTP Request",
          status: "running",
          message: `${method} ${url}`,
        });

        try {
          const requestInit: RequestInit = {
            method,
            headers: {
              "Content-Type": "application/json",
            },
          };

          if (method !== "GET" && method !== "DELETE") {
            requestInit.body = payload ?? null;
          }

          const response = await fetch(url, requestInit);
          const rawBody = await response.text();
          let output = rawBody;
          try {
            output = JSON.stringify(JSON.parse(rawBody), null, 2);
          } catch {
            // Keep non-JSON response bodies as-is.
          }
          emit({
            nodeId: node.id,
            label: node.data?.label || "HTTP Request",
            status: response.ok ? "success" : "error",
            message: response.ok ? "Request succeeded" : "Request failed",
            statusCode: response.status,
            output,
          });

          if (!response.ok) {
            canContinueBranch = false;
          }
        } catch (error: any) {
          emit({
            nodeId: node.id,
            label: node.data?.label || "HTTP Request",
            status: "error",
            message: error?.message || "Request failed",
          });
          canContinueBranch = false;
        }
      }
    } else {
      emit({
        nodeId: node.id,
        label: node.data?.label || node.type || "Node",
        status: "skipped",
        message: "Node type not executable yet",
      });
    }

    if (!canContinueBranch) continue;

    const nextEdges = outgoing.get(currentNodeId) ?? [];
    for (const edge of nextEdges) {
      if (!edge.target || visited.has(edge.target) || queued.has(edge.target)) continue;
      queue.push(edge.target);
      queued.add(edge.target);
    }
  }

  return statuses;
};

export const createWorkflow = async (req: any, res: Response) => {
  const userId = req.user.id;
  const baseName = typeof req.body?.name === "string" && req.body.name.trim()
    ? req.body.name.trim()
    : "My Workflow";

  try {
    const workflow = await postgresService.createWorkflowWithAutoName(userId, baseName, {});
    res.status(201).json({
      success: true,
      workflow,
    });
  } catch (error: any) {
    logger.error(`[WorkflowController] Create workflow failed: ${error.message}`);
    res.status(500).json({ success: false, message: "Failed to create workflow." });
  }
};

export const listWorkflows = async (req: any, res: Response) => {
  const userId = req.user.id;
  try {
    const workflows = await postgresService.findWorkflowsByUserId(userId);
    res.json({
      success: true,
      workflows,
    });
  } catch (error: any) {
    logger.error(`[WorkflowController] List workflows failed: ${error.message}`);
    res.status(500).json({ success: false, message: "Failed to load workflows." });
  }
};

export const deleteWorkflow = async (req: any, res: Response) => {
  const userId = req.user.id;
  const workflowId = req.params.id;

  try {
    const deleted = await postgresService.deleteWorkflowForUser(workflowId, userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Workflow not found." });
    }

    res.json({
      success: true,
      message: "Workflow deleted successfully.",
    });
  } catch (error: any) {
    logger.error(`[WorkflowController] Delete workflow failed: ${error.message}`);
    res.status(500).json({ success: false, message: "Failed to delete workflow." });
  }
};

export const getWorkflowById = async (req: any, res: Response) => {
  const userId = req.user.id;
  const workflowId = req.params.id;

  try {
    const workflow = await postgresService.findWorkflowByIdForUser(workflowId, userId);
    if (!workflow) {
      return res.status(404).json({ success: false, message: "Workflow not found." });
    }

    res.json({
      success: true,
      workflow,
    });
  } catch (error: any) {
    logger.error(`[WorkflowController] Get workflow failed: ${error.message}`);
    res.status(500).json({ success: false, message: "Failed to load workflow." });
  }
};

export const updateWorkflow = async (req: any, res: Response) => {
  const userId = req.user.id;
  const workflowId = req.params.id;
  const name = typeof req.body?.name === "string" ? req.body.name : undefined;
  const data = req.body?.data;

  try {
    const updated = await postgresService.updateWorkflowForUser(workflowId, userId, {
      name,
      data,
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Workflow not found." });
    }

    res.json({
      success: true,
      workflow: updated,
    });
  } catch (error: any) {
    logger.error(`[WorkflowController] Update workflow failed: ${error.message}`);
    res.status(500).json({ success: false, message: "Failed to update workflow." });
  }
};

export const executeWorkflow = async (req: any, res: Response) => {
  const userId = req.user.id;
  const workflowId = req.params.id;

  try {
    const workflow = await postgresService.findWorkflowByIdForUser(workflowId, userId);
    if (!workflow) {
      return res.status(404).json({ success: false, message: "Workflow not found." });
    }

    const statuses = await runWorkflowSequence(workflow);

    res.json({
      success: true,
      run: {
        workflowId,
        executedAt: new Date().toISOString(),
        statuses,
      },
    });
  } catch (error: any) {
    logger.error(`[WorkflowController] Execute workflow failed: ${error.message}`);
    res.status(500).json({ success: false, message: "Failed to execute workflow." });
  }
};

export const executeWorkflowStream = async (req: Request, res: Response) => {
  const workflowIdRaw = req.params.id;
  const workflowId = Array.isArray(workflowIdRaw) ? workflowIdRaw[0] : workflowIdRaw;
  const tokenRaw = req.query.token;
  const token = Array.isArray(tokenRaw) ? tokenRaw[0] : tokenRaw || "";

  if (!workflowId) {
    return res.status(400).json({ success: false, message: "Missing workflow id." });
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Missing session token." });
  }

  try {
    const { rows } = await postgresService.pool.query(
      'SELECT s.*, u.id as "userId" FROM session s JOIN "user" u ON s."userId" = u.id WHERE s.token = $1 AND s."expiresAt" > CURRENT_TIMESTAMP',
      [token]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid or expired session." });
    }

    const userId = rows[0].userId as string;
    const workflow = await postgresService.findWorkflowByIdForUser(workflowId, userId);
    if (!workflow) {
      return res.status(404).json({ success: false, message: "Workflow not found." });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const send = (event: string, payload: unknown) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    send("started", {
      workflowId,
      startedAt: new Date().toISOString(),
    });

    const statuses = await runWorkflowSequence(workflow, (status) => {
      send("node-status", status);
    });

    send("completed", {
      workflowId,
      executedAt: new Date().toISOString(),
      statuses,
    });
    res.end();
  } catch (error: any) {
    logger.error(`[WorkflowController] Execute workflow stream failed: ${error.message}`);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: "Failed to stream execution." });
    }
    res.write(`event: error\ndata: ${JSON.stringify({ message: "Execution stream failed." })}\n\n`);
    res.end();
  }
};
