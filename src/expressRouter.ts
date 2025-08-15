// src/expressRouter.ts
import { FeatureFlagService } from "./FeatureFlagService";
import type { Router, Request, Response, NextFunction } from "express";

export async function createFlaggleRouter(
  featureFlagService: FeatureFlagService
): Promise<Router> {
  let express: typeof import("express");
  try {
    const expressModule = await import("express");
    express = expressModule.default;
  } catch {
    throw new Error(
      "Express is required to use the router. Install it with: npm install express"
    );
  }

  const router = express.Router();

  // Helper to catch async errors
  const wrapAsync =
    (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
      fn(req, res, next).catch(next);

  // Get single flag
  router.get(
    "/:env/:key",
    wrapAsync(async (req: Request, res: Response) => {
      const { env, key } = req.params;
      const enabled = await featureFlagService.isEnabled(key, env);
      res.json({ key, enabled });
    })
  );

  // Get all flags for an environment
  router.get(
    "/:env",
    wrapAsync(async (req: Request, res: Response) => {
      const { env } = req.params;
      const flags = await featureFlagService.getAllFlags(env);
      res.json(flags);
    })
  );

  return router;
}
