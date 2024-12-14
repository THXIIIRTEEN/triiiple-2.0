declare global {
    namespace NodeJS {
      interface ProcessEnv {
        MONGODB_URI: string;
        EMAIL_USER: string;
        EMAIL_PASS: string;
        FRONTEND_URL: string;
        BACKEND_URL: string;
        CAPTCHA_SITE_KEY: string;
        CAPTCHA_SECRET_KEY: string;
        SECRET_KEY: string;
        NODE_ENV: string;
        CLOUD_SECRET_LEY: string;
        CLOUD_KEY_ID: string;
        GOOGLE_CLIENT_ID: string;
        GOOGLE_CLIENT_SECRET: string;
        VK_SECURITY_KEY: string;
        VK_SERVICE_KEY: string;
        GITHUB_ID: string;
        GITHUB_SECRET: string;
        DISCORD_ID: string;
        DISCORD_SECRET: string;
      }
    }
  }
  
export {};
  