import express from "express";
import { createContainer } from "../utils/containers.util.js";

const router = express.Router();
const host = process.env.HOST;

router.post("/create", async (req, res) => {
  const { name } = req.body;
  const ip = req.ip;
  const container = await createContainer(name);
  const port = container.port
  const pass = container.password
  res.json({"url":host, "port":port, "password": pass})
});

export default router;