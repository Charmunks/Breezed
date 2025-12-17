import "dotenv/config";
import express from "express";
import containerRouter from "./routes/container.js";
import authRouter from "./routes/auth.js";
import { startAutoStopScheduler } from "./utils/autoStop.util.js";
import adminRouter from "./routes/admin.js"
import { rateLimit } from "./middleware/rateLimit.middleware.js";

const app = express();

app.use(express.json());
app.use(rateLimit);

app.use("/auth", authRouter);
app.use("/", containerRouter);
app.use("/admin", adminRouter);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startAutoStopScheduler();
});
