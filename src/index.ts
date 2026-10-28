import express from "express";

import { handlerReadiness, handlerServerHits, handlerResetServerHits, handlerDecode } from "./api/readiness.js";
import { middlewareLogResponse, middlewareMetricsInc, middlewareValidateChirp } from "./api/middleware.js";


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

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
