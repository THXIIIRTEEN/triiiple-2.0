declare global {
    namespace NodeJS {
      interface ProcessEnv {
        MONGODB_URI: string;
        EMAIL_USER: string;
        EMAIL_PASS: string;
        FRONTEND_URL: string;
        BACKEND_URL: string;
        WEBSOCKET_URL: string;
        CAPTCHA_SITE_KEY: string;
        CAPTCHA_SECRET_KEY: string;
        SECRET_KEY: string;
        NODE_ENV: string;
        CLOUD_SECRET_LEY: string;
        CLOUD_KEY_ID: string;
        GOOGLE_CLIENT_ID: string;
        GOOGLE_CLIENT_SECRET: string;
        VK_CLIENT_ID: string;
        VK_CLIENT_SECRET: string;
        GITHUB_CLIENT_ID: string;
        GITHUB_CLIENT_SECRET: string;
        DISCORD_CLIENT_ID: string;
        DISCORD_CLIENT_SECRET: string;
        DISCORD_URL: string;
        YANDEX_KMS: string;
        YANDEX_OAUTH: string;
      }
    }
  }
  
export {};
  