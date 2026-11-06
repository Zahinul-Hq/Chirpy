import type { Request, Response } from "express";

import { config } from "../config.js";
import { createRefreshToken } from "../db/queries/refreshTokens.js";
import { retrieveUserByEmail } from "../db/queries/users.js";
import { checkPasswordHash, makeJWT, makeRefreshToken } from "./auth.js";
import { UnauthorizedError } from "./errors.js";
import { respondWithJSON } from "./readiness.js";

export async function handlerLogin(req: Request, res: Response) {
  const params: { email?: string; password?: string } = req.body;

  if (!params?.email || !params.password) {
    throw new UnauthorizedError("incorrect email or password");
  }

  let user;
  try {
    user = await retrieveUserByEmail(params.email);
  } catch {
    throw new UnauthorizedError("incorrect email or password");
  }

  if (!user) {
    throw new UnauthorizedError("incorrect email or password");
  }

  let passwordMatches: boolean;
  try {
    passwordMatches = await checkPasswordHash(params.password, user.hashed_password);
  } catch {
    throw new UnauthorizedError("incorrect email or password");
  }

  if (!passwordMatches) {
    throw new UnauthorizedError("incorrect email or password");
  }

  const token = makeJWT(user.id, 3600, config.api.jwtSecret);
  const refreshToken = makeRefreshToken();
  const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
  await createRefreshToken({
    token: refreshToken,
    userId: user.id,
    expiresAt,
    revokedAt: null,
  });

  respondWithJSON(res, 200, {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    email: user.email,
    token,
    refreshToken,
  });
}