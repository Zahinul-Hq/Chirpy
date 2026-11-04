import type { Request, Response } from "express";
import { config } from "../config.js";
import { ForbiddenError } from "./errors.js";
import { reset } from "../db/queries/users.js";


export async function handlerReadiness(_: Request, res: Response) {
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send("OK");
}
export async function handlerServerHits(_: Request, res: Response) {
      res.set("Content-Type", "text/html; charset=utf-8");
  res.send(`<html>
          <body>
            <h1>Welcome, Chirpy Admin</h1>
            <p>Chirpy has been visited ${config.api.fileserverHits} times!</p>
          </body>
        </html>
    `);
}
export async function handlerResetServerHits(_: Request, res: Response) {
    if (config.api.platform !== "dev") {
      console.log(config.api.platform);
      throw new ForbiddenError("Reset is only allowed in dev environment.");
    }
    config.api.fileserverHits = 0;
    await reset();
    res.send(`Hits reset to: ${config.api.fileserverHits}`);
    res.end();
}
export async function handlerDecode(req: Request, res: Response) {
  let body = ""; // 1. Initialize

  // 2. Listen for data events
  req.on("data", (chunk) => {
    body += chunk;
  });

  // 3. Listen for end events
  req.on("end", () => {
    try {
      const parsedBody = JSON.parse(body);
      if(parsedBody.body.length > 140) {
        type responseData = {
          error: string;
        };
        const respBody: responseData = {
          error: "Chirp is too long",
        };
        res.header("Content-Type", "application/json");
        const body = JSON.stringify(respBody);
        res.status(400).send(body);
      }else{
        type responseData = {
          valid: boolean;
        };
        const respBody: responseData = {
          valid: true,
        };
        res.header("Content-Type", "application/json");
        const body = JSON.stringify(respBody);
        res.status(200).send(body);
      }
    } catch (error) {
      res.status(400).send("Invalid JSON");
    }
  });
}
export function respondWithError(res: Response, code: number, message: string) {
  respondWithJSON(res, code, { error: message });
}

export function respondWithJSON(res: Response, code: number, payload: any) {
  res.header("Content-Type", "application/json");
  const body = JSON.stringify(payload);
  res.status(code).send(body);
}
