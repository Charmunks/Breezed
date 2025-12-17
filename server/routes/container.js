import express from "express";
import { createContainer } from "../utils/containers.util.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();
const host = process.env.HOST;

router.post("/create", requireAuth, async (req, res) => {
  const { name } = req.body;
  const userId = req.user.user_id;
  const container = await createContainer(name, userId);
  const port = container.port;
  const pass = container.password;
  res.json({ url: host, port: port, password: pass });
});

export default router;