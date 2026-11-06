import { and, asc, eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewChirp, chirps } from "../schema.js";

export async function createChirp(chirp: NewChirp) {
  const [result] = await db
    .insert(chirps)
    .values(chirp)
    .returning();
  return result;
}
export async function retrieveChirpsByCreationAsec() {
  return db
    .select()
    .from(chirps)
    .orderBy(asc(chirps.createdAt));
}

export async function retrieveChirpById(chirpId: string) {
  const [result] = await db
    .select()
    .from(chirps)
    .where(eq(chirps.id, chirpId));
  return result;
}

export async function deleteChirpById(chirpId: string, userId: string) {
  const [result] = await db
    .delete(chirps)
    .where(and(eq(chirps.id, chirpId), eq(chirps.userId, userId)))
    .returning({ id: chirps.id });
  return result;
}