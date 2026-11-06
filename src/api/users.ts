import type { Request, Response } from "express";

import { createUser, updateUser } from "../db/queries/users.js";
import { BadRequestError, NotFoundError, UnauthorizedError } from "./errors.js";
import { respondWithJSON } from "./readiness.js";
import { getBearerToken, hashPassword, validateJWT } from "./auth.js";
import { config } from "../config.js";

export async function handlerUsersCreate(req: Request, res: Response) {
  type parameters = {
    email: string;
    password: string;
  };
  const params: parameters = req.body;

  if (!params.email || !params.password) {
    throw new BadRequestError("Missing required fields");
  }
  const hashpass = await hashPassword(params.password);

  const user = await createUser({ email: params.email, hashed_password: hashpass });

  if (!user) {
    throw new Error("Could not create user");
  }

  respondWithJSON(res, 201, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
}

export async function handlerUsersUpdate(req: Request, res: Response) {
  let token: string;
  try {
    token = getBearerToken(req);
  } catch (error) {
    if (error instanceof BadRequestError) {
      throw new UnauthorizedError("Invalid authorization header");
    }
    throw error;
  }
  const userId = validateJWT(token, config.api.jwtSecret);

  const payload: unknown = req.body;
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new BadRequestError("Request body must be a JSON object");
  }
  const { email, password } = payload as Record<string, unknown>;
  if (typeof email !== "string" || !email || typeof password !== "string" || !password) {
    throw new BadRequestError("Email and password are required");
  }

  const hashedPassword = await hashPassword(password);
  const user = await updateUser(userId, email, hashedPassword);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  respondWithJSON(res, 200, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
}
