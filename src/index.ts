import express from "express";

import { handlerReadiness, handlerServerHits, handlerResetServerHits } from "./api/readiness.js";
import { middlewareLogResponse, middlewareMetricsInc, middlewareValidateChirp, middlewareErrorHandler } from "./api/middleware.js";


const app = express();
const PORT = 8080;

app.use(middlewareLogResponse);
app.use(express.json());
app.use("/app", middlewareMetricsInc);
app.use("/app", express.static("./src/app"));
app.get("/admin/metrics", handlerServerHits, express.static("./src/admin/metrics.html"));
app.post("/admin/reset", handlerResetServerHits);
app.post("/api/validate_chirp", middlewareValidateChirp);
app.get("/api/healthz", handlerReadiness);
app.use(middlewareErrorHandler);
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
