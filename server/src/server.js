import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { router } from "../routes/index.js";
import { errorHandler } from "../middleware/errorHandler.js";

const app = express();
const port = process.env.PORT ?? 4000;
const isProduction = process.env.NODE_ENV === "production";
if (isProduction && (!process.env.DATABASE_URL || !process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.includes("replace-with"))) {
  throw new Error("Production requires DATABASE_URL and a random JWT_SECRET of at least 32 characters.");
}
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
app.use("/api", (req, res) => res.status(404).json({ error: true, message: "API route not found", code: "NOT_FOUND" }));
if (isProduction) {
  const clientDist = fileURLToPath(new URL("../../client/dist/", import.meta.url));
  app.use(express.static(clientDist));
  app.get("*", (req, res) => res.sendFile(path.join(clientDist, "index.html")));
}
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Fitness optimizer API listening on http://localhost:${port}`);
});
