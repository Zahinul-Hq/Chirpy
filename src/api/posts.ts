import type { Request, Response } from "express";
import {
  createChirp,
  deleteChirpById,
  retrieveChirpById,
  retrieveChirpsByCreationAsec,
} from "../db/queries/posts.js";
import { config } from "../config.js";
import { getBearerToken, validateJWT } from "./auth.js";
import { BadRequestError, ForbiddenError, NotFoundError } from "./errors.js";

export async function handlerChirpGet(req: Request, res: Response) {
  const { chirpId } = req.params;

  if (
    typeof chirpId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      chirpId,
    )
  ) {
    throw new NotFoundError("Chirp not found");
  }

  const chirp = await retrieveChirpById(chirpId);
  if (!chirp) {
    throw new NotFoundError("Chirp not found");
  }

  res.status(200).json({
    id: chirp.id,
    createdAt: chirp.createdAt,
    updatedAt: chirp.updatedAt,
    body: chirp.body,
    userId: chirp.userId,
  });
}

export async function handlerChirpsGet(_req: Request, res: Response) {
  const chirps = await retrieveChirpsByCreationAsec();

  res.status(200).json(
    chirps.map((chirp) => ({
      id: chirp.id,
      createdAt: chirp.createdAt,
      updatedAt: chirp.updatedAt,
      body: chirp.body,
      userId: chirp.userId,
    })),
  );
}

export async function handlerChirpsCreate(req: Request, res: Response) {
  const token = getBearerToken(req);
  const userId = validateJWT(token, config.api.jwtSecret);

  const payload: unknown = req.body;
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new BadRequestError("Request body must be a JSON object");
  }

  const { body } = payload as Record<string, unknown>;

  if (typeof body !== "string") {
    throw new BadRequestError("Chirp body must be a string");
  }
  if (body.length > 140) {
    throw new BadRequestError("Chirp is too long. Max length is 140");
  }
  const profaneWords = ["kerfuffle", "sharbert", "fornax"];
  const cleanedBody = body
    .split(/(\s+)/)
    .map((word) => (profaneWords.includes(word.toLowerCase()) ? "****" : word))
    .join("");

  const chirp = await createChirp({ body: cleanedBody, userId });

  res.status(201).json({
    id: chirp.id,
    createdAt: chirp.createdAt,
    updatedAt: chirp.updatedAt,
    body: chirp.body,
    userId: chirp.userId,
  });
}

export async function handlerChirpDelete(req: Request, res: Response) {
  const token = getBearerToken(req);
  const userId = validateJWT(token, config.api.jwtSecret);
  const { chirpId } = req.params;

  if (
    typeof chirpId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      chirpId,
    )
  ) {
    throw new NotFoundError("Chirp not found");
  }

  const chirp = await retrieveChirpById(chirpId);
  if (!chirp) {
    throw new NotFoundError("Chirp not found");
  }
  if (chirp.userId !== userId) {
    throw new ForbiddenError("You are not the author of this chirp");
  }

  const deletedChirp = await deleteChirpById(chirpId, userId);
  if (!deletedChirp) {
    throw new NotFoundError("Chirp not found");
  }

  res.status(204).end();
}
