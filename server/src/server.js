import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { router } from "../routes/index.js";
import { errorHandler } from "../middleware/errorHandler.js";

const app = express();
const port = process.env.PORT ?? 4000;
const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  "http://localhost:5173",
  "http://127.0.0.1:5173"
].filter(Boolean);

app.use(helmet());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use("/api", router);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Fitness optimizer API listening on http://localhost:${port}`);
});
