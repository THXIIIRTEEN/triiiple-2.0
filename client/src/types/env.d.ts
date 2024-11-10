declare namespace NodeJS {
    interface ProcessEnv {
      API_URI: string;
      CAPTCHA_SITE_KEY: string;
      CAPTCHA_SECRET_KEY: string;
      NODE_ENV: string;
    }
}