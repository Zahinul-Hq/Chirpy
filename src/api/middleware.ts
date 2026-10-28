import type { Request, Response, NextFunction } from "express";
import express from "express";
import { config } from "../config.js";

export function middlewareLogResponse(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  res.on("finish", () => {
    const statusCode = res.statusCode;

    if (statusCode >= 300) {
      console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
    }
  });

  next();
}

export function middlewareMetricsInc(req: Request, res: Response, next: NextFunction) {
    config.api.fileserverHits++;
    next();
}
export function middlewareValidateChirp(req: Request, res: Response) {
  const { body } = req.body as { body: string };

  if (body.length > 140) {
    res.status(400).json({ error: "Chirp is too long" });
    return;
  }

  const profaneWords = ["kerfuffle", "sharbert", "fornax"];
  const cleanedBody = body
    .split(/(\s+)/)
    .map((word) => (profaneWords.includes(word.toLowerCase()) ? "****" : word))
    .join("");

  res.status(200).json({ cleanedBody });
}
