import type { MigrationConfig } from "drizzle-orm/migrator";
process.loadEnvFile('./.env');

export function envOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

type APIConfig = {
  fileserverHits: number;
  port: number;
  platform: string;
};
const migrationConfig: MigrationConfig = {
  migrationsFolder: "./src/db/migrations",
};
type DBConfig = {
    dbURL: string;
    migrationConfig: MigrationConfig;
}
export class Config{
    api: APIConfig;
    dbConfig: DBConfig;
    constructor() {
        this.api = {
            fileserverHits: 0,
            port: parseInt(envOrThrow('PORT')),
            platform: envOrThrow("PLATFORM"),
        };
        this.dbConfig = {
            dbURL: envOrThrow('DB_URL'),
            migrationConfig,
        };
    }
}
export const config = new Config();