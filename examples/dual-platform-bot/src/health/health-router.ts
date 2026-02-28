import express from "express";

export interface PlatformStatus {
  slack: "connected" | "disconnected" | "unknown";
  teams: "connected" | "disconnected" | "unknown";
}

const status: PlatformStatus = {
  slack: "unknown",
  teams: "unknown",
};

export function setSlackStatus(s: PlatformStatus["slack"]): void {
  status.slack = s;
}

export function setTeamsStatus(s: PlatformStatus["teams"]): void {
  status.teams = s;
}

/** Express router for GET /health — returns connection status for both platforms. */
export function createHealthRouter(): express.Router {
  const router = express.Router();

  router.get("/health", (_req, res) => {
    const healthy = status.slack === "connected" && status.teams === "connected";
    res.status(healthy ? 200 : 503).json({
      status: healthy ? "healthy" : "degraded",
      platforms: status,
      uptime: process.uptime(),
    });
  });

  return router;
}
