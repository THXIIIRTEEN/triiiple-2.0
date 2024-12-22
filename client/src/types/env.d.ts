declare namespace NodeJS {
    interface ProcessEnv {
      API_URI: string;
      WEBSOCKET_URL: string;
      CAPTCHA_SITE_KEY: string;
      CAPTCHA_SECRET_KEY: string;
      NODE_ENV: string;
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      GITHUB_ID: string;
      GITHUB_SECRET: string;
      DISCORD_ID: string;
      DISCORD_SECRET: string;
      NEXTAUTH_URL: string;
      NEXTAUTH_SECRET: string;
    }
}