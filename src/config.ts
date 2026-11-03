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
  dbURL: string;
};
export class Config{
    api: APIConfig;

    constructor() {
        this.api = {
            fileserverHits: 0,
            dbURL: envOrThrow('DB_URL'),
        };
    }
}
export const config = new Config();