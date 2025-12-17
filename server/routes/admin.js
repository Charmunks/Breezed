import express from "express";
import { createContainer, startContainer, stopContainer, removeContainer, listContainers } from "../utils/containers.util.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();
const host = process.env.HOST;

router.get("/containers", requireAuth, requireAdmin, async (req, res) => {
  try {
    const containers = await listContainers();
    res.json({ containers });
  } catch (err) {
    return res.status(500).json({ error: "Failed to list containers" });
  }
});

router.post("/create", requireAuth, requireAdmin, async (req, res) => {
  const { name, targetUserId } = req.body;
  try {
    const container = await createContainer(name, targetUserId);
    const port = container.port;
    const pass = container.password;
    res.json({ url: host, port: port, password: pass });
  } catch (err) {
    if (err.message.includes("already exists")) {
      return res.status(409).json({ error: err.message });
    }
    return res.status(500).json({ error: "Failed to create container" });
  }
});

router.post("/start", requireAuth, requireAdmin, async (req, res) => {
  const { name, targetUserId } = req.body;
  const requesterId = req.user.user_id;
  try {
    await startContainer(name, requesterId, targetUserId);
    res.json({ message: `Container "${name}" started` });
  } catch (err) {
    if (err.statusCode === 404) {
      return res.status(404).json({ error: "Container not found" });
    }
    if (err.statusCode === 304) {
      return res.status(304).json({ error: "Container already running" });
    }
    return res.status(500).json({ error: "Failed to start container" });
  }
});

router.post("/stop", requireAuth, requireAdmin, async (req, res) => {
  const { name, targetUserId } = req.body;
  const requesterId = req.user.user_id;
  try {
    await stopContainer(name, requesterId, targetUserId);
    res.json({ message: `Container "${name}" stopped` });
  } catch (err) {
    if (err.statusCode === 404) {
      return res.status(404).json({ error: "Container not found" });
    }
    if (err.statusCode === 304) {
      return res.status(304).json({ error: "Container already stopped" });
    }
    return res.status(500).json({ error: "Failed to stop container" });
  }
});

router.delete("/remove", requireAuth, requireAdmin, async (req, res) => {
  const { name, targetUserId } = req.body;
  const requesterId = req.user.user_id;
  try {
    await removeContainer(name, requesterId, targetUserId);
    res.json({ message: `Container "${name}" removed` });
  } catch (err) {
    if (err.statusCode === 404) {
      return res.status(404).json({ error: "Container not found" });
    }
    return res.status(500).json({ error: "Failed to remove container" });
  }
});

export default router;
