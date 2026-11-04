import express from "express";
process.loadEnvFile("./.env");
import { handlerReadiness, handlerServerHits, handlerResetServerHits } from "./api/readiness.js";
import { middlewareLogResponse, middlewareMetricsInc, middlewareValidateChirp, middlewareErrorHandler } from "./api/middleware.js";
import {migrationClient} from "./db/index.js";
import { handlerUsersCreate } from "./api/users.js";
import { config } from "./config.js";

const app = express();
const PORT = config.api.port;
migrationClient;

app.use(middlewareLogResponse);
app.use(express.json());
app.use("/app", middlewareMetricsInc);
app.use("/app", express.static("./src/app"));
app.get("/admin/metrics", handlerServerHits, express.static("./src/admin/metrics.html"));
app.post("/admin/reset", handlerResetServerHits);
app.post("/api/validate_chirp", middlewareValidateChirp);
app.post("/api/users", (req, res, next) => {
  Promise.resolve(handlerUsersCreate(req, res)).catch(next);
});
app.get("/api/healthz", handlerReadiness);
app.use(middlewareErrorHandler);
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
