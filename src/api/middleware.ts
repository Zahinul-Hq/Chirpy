import type { Request, Response, NextFunction } from "express";
import express from "express";
import { config } from "../config.js";
import { BadRequestError, HttpError } from "./errors.js";

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
    throw new BadRequestError("Chirp is too long. Max length is 140");
  }

  const profaneWords = ["kerfuffle", "sharbert", "fornax"];
  const cleanedBody = body
    .split(/(\s+)/)
    .map((word) => (profaneWords.includes(word.toLowerCase()) ? "****" : word))
    .join("");

  res.status(200).json({ cleanedBody });
}
export function middlewareErrorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({
    error: "Something went wrong on our end",
  });
}
