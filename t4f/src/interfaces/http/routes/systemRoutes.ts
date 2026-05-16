import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "../asyncHandler";
import { renderHttpMetrics } from "../middleware/httpMetrics";
import { openApiDocument } from "../openapi";

export function createSystemRoutes(prisma: PrismaClient) {
  const router = Router();

  router.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "thoughts-for-food-api",
    });
  });

  router.get("/openapi.json", (_req, res) => {
    res.status(200).json(openApiDocument);
  });

  router.get("/metrics", (_req, res) => {
    res.type("text/plain").status(200).send(renderHttpMetrics());
  });

  router.get(
    "/ready",
    asyncHandler(async (_req, res) => {
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({
        status: "ready",
        database: "reachable",
      });
    }),
  );

  return router;
}
