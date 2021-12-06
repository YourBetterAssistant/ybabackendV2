namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly PORT: string;
    readonly DB: string;
    readonly SECRET: string;
    readonly CLIENTID: string;
    readonly CLIENTSECRET: string;
    readonly CALLBACKURL: string;
    readonly FRONTENDURL: string;
    readonly BOTTOKEN: string;
    readonly REDISHOST: string;
    readonly REDISPORT: number;
    readonly REDISUSER: string;
  }
}
