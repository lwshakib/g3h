import { Router } from "express";
import authRoutes from "./auth.routes.js";
import appsRoutes from "./apps.routes.js";
import userRoutes from "./user.routes.js";
import workflowRoutes from "./workflow.routes.js";

const router: Router = Router();

router.use("/v1/auth", authRoutes);
router.use("/v1/apps", appsRoutes);
router.use("/v1/user", userRoutes);
router.use("/v1/workflow", workflowRoutes);

router.get("/", (req, res) => {
  res.json({ message: "Welcome to Axonix API" });
});

export default router;
