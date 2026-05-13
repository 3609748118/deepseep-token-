import express from "express";
import cors from "cors";
import { existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { CONFIG } from "./config.js";
import proxyRouter from "./proxy.js";
import summaryRouter from "./routes/summary.js";
import usageRouter from "./routes/usage.js";
import refreshRouter from "./routes/refresh.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

app.use(proxyRouter);
app.use("/api", summaryRouter);
app.use("/api", usageRouter);
app.use("/api", refreshRouter);

const clientDist = resolve(__dirname, "../../client/dist");
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("/{*path}", (_req, res) => {
    res.sendFile(resolve(clientDist, "index.html"));
  });
}

app.listen(CONFIG.PORT, () => {
  console.log(`[server] Running on http://localhost:${CONFIG.PORT}`);
  console.log(`[server] Proxy: http://localhost:${CONFIG.PORT}/proxy/v1/chat/completions`);
});
