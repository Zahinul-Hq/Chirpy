type APIConfig = {
  fileserverHits: number;
};
export class Config{
    api: APIConfig;
    constructor() {
        this.api = {
            fileserverHits: 0
        };
    }
}
export const config = new Config();