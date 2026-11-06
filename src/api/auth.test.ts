import { beforeAll, describe, expect, it } from "vitest";

import { BadRequestError } from "./errors.js";
import {
  extractBearerToken,
  makeJWT,
  makeRefreshToken,
  validateJWT,
} from "./auth.js";

describe("makeRefreshToken", () => {
  it("returns a 32-byte random value encoded as hex", () => {
    const token = makeRefreshToken();

    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("extractBearerToken", () => {
  it("extracts a token from a Bearer authorization header", () => {
    expect(extractBearerToken("Bearer TOKEN_STRING")).toBe("TOKEN_STRING");
  });

  it("trims surrounding whitespace", () => {
    expect(extractBearerToken("  Bearer TOKEN_STRING  ")).toBe("TOKEN_STRING");
  });

  it.each([
    undefined,
    "",
    "Basic TOKEN_STRING",
    "Bearer",
    "Bearer ",
    "Bearer TOKEN_STRING extra",
  ])("rejects an invalid authorization header: %s", (authorization) => {
    expect(() => extractBearerToken(authorization)).toThrow(BadRequestError);
  });
});

describe("JWT", () => {
  const userID = "f0f87ec2-a8b5-48cc-b66a-a85ce7c7b862";
  const secret = "test-secret";
  let token: string;

  beforeAll(() => {
    token = makeJWT(userID, 60, secret);
  });

  it("creates and validates a token for the user", () => {
    expect(validateJWT(token, secret)).toBe(userID);
  });

  it("rejects expired tokens", () => {
    const expiredToken = makeJWT(userID, -1, secret);

    expect(() => validateJWT(expiredToken, secret)).toThrow();
  });

  it("rejects tokens signed with a different secret", () => {
    expect(() => validateJWT(token, "wrong-secret")).toThrow();
  });
});
