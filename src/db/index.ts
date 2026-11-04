import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";

import * as schema from "./schema.js";
import { config } from "../config.js";

const conn = postgres(config.dbConfig.dbURL);
export const db = drizzle(conn, { schema });
export const migrationClient = postgres(config.dbConfig.dbURL, { max: 1 });
await migrate(drizzle(migrationClient), config.dbConfig.migrationConfig);