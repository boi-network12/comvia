// src/types/env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    NODE_ENV: 'development' | 'production' | 'test';
    ALLOWED_ORIGINS: string;
    JWT_SECRET: string;
    API_URL: string;
    BASE_URL: string;
  }
}