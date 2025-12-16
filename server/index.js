import "dotenv/config";
import express from "express";
import containerRouter from "./routes/container.js";

const app = express();

app.use(express.json());

app.use("/", containerRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
