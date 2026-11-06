import type { Request } from "express";
import { randomBytes } from "node:crypto";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { BadRequestError, UnauthorizedError } from "./errors.js";

export function getBearerToken(req: Request): string {
  const authorization = req.get("Authorization");
  if (!authorization) {
    throw new UnauthorizedError("Authorization header is required");
  }
  return extractBearerToken(authorization);
}

export function extractBearerToken(authorization: string | undefined): string {
  const [scheme, token, ...extraParts] = authorization?.trim().split(/\s+/) ?? [];
  if (scheme !== "Bearer" || !token || extraParts.length > 0) {
    throw new BadRequestError("Invalid authorization header");
  }
  return token;
}

export function makeRefreshToken(): string {
  return randomBytes(32).toString("hex");
}

export async function hashPassword(password: string): Promise<string>{
  return argon2.hash(password);
}

export async function checkPasswordHash(
  password: string,
  hash: string,
): Promise<boolean> {
  return argon2.verify(hash, password);
}

type TokenPayload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function makeJWT(userID: string, expiresIn: number, secret: string): string {
  const iat = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    iss: "chirpy",
    sub: userID,
    iat,
    exp: iat + expiresIn,
  };

  return jwt.sign(payload, secret);
}

export function validateJWT(tokenString: string, secret: string): string {
  let decoded: string | JwtPayload;
  try {
    decoded = jwt.verify(tokenString, secret);
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
  if (typeof decoded !== "object" || typeof decoded.sub !== "string") {
    throw new UnauthorizedError("Invalid token");
  }
  return decoded.sub;
}