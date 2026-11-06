import type { Request, Response } from "express";

import { revokeRefreshToken } from "../db/queries/refreshTokens.js";
import { getBearerToken } from "./auth.js";

export async function handlerRevoke(req: Request, res: Response) {
  const refreshToken = getBearerToken(req);
  await revokeRefreshToken(refreshToken);
  res.status(204).end();
}
