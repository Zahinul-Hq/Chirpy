import type { Request, Response } from "express";

import { config } from "../config.js";
import { userForRefreshToken } from "../db/queries/refreshTokens.js";
import { getBearerToken, makeJWT } from "./auth.js";
import { UnauthorizedError } from "./errors.js";

export async function handlerRefresh(req: Request, res: Response) {
  const refreshToken = getBearerToken(req);
  const user = await userForRefreshToken(refreshToken);

  if (!user || user.revokedAt !== null || user.expiresAt <= new Date()) {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }

  const token = makeJWT(user.id, 3600, config.api.jwtSecret);
  res.status(200).json({ token });
}
