import express from "express";
process.loadEnvFile("./.env");
import { handlerReadiness, handlerServerHits, handlerResetServerHits } from "./api/readiness.js";
import { middlewareLogResponse, middlewareMetricsInc, middlewareErrorHandler } from "./api/middleware.js";
import {migrationClient} from "./db/index.js";
import { handlerUsersCreate, handlerUsersUpdate } from "./api/users.js";
import { handlerLogin } from "./api/login.js";
import { handlerRefresh } from "./api/refresh.js";
import { handlerRevoke } from "./api/revoke.js";
import {
  handlerChirpDelete,
  handlerChirpGet,
  handlerChirpsCreate,
  handlerChirpsGet,
} from "./api/posts.js";
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
app.post("/api/chirps", (req, res, next) => {
  Promise.resolve(handlerChirpsCreate(req, res)).catch(next);
});
app.get("/api/chirps", (req, res, next) => {
  Promise.resolve(handlerChirpsGet(req, res)).catch(next);
});
app.get("/api/chirps/:chirpId", (req, res, next) => {
  Promise.resolve(handlerChirpGet(req, res)).catch(next);
});
app.delete("/api/chirps/:chirpId", (req, res, next) => {
  Promise.resolve(handlerChirpDelete(req, res)).catch(next);
});
app.post("/api/users", (req, res, next) => {
  Promise.resolve(handlerUsersCreate(req, res)).catch(next);
});
app.put("/api/users", (req, res, next) => {
  Promise.resolve(handlerUsersUpdate(req, res)).catch(next);
});
app.post("/api/login", (req, res, next) => {
  Promise.resolve(handlerLogin(req, res)).catch(next);
});
app.post("/api/refresh", (req, res, next) => {
  Promise.resolve(handlerRefresh(req, res)).catch(next);
});
app.post("/api/revoke", (req, res, next) => {
  Promise.resolve(handlerRevoke(req, res)).catch(next);
});
app.get("/api/healthz", handlerReadiness);
app.use(middlewareErrorHandler);
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
