import { Router } from "express";
import { appsRegistry, getAppByKey } from "../apps/index.js";

const router: Router = Router();

router.get("/", (_req, res) => {
  res.json({
    success: true,
    apps: appsRegistry,
  });
});

router.get("/:key", (req, res) => {
  const app = getAppByKey(req.params.key);
  if (!app) {
    return res.status(404).json({
      success: false,
      message: "App not found.",
    });
  }

  res.json({
    success: true,
    app,
  });
});

export default router;
