import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    const apiUri = process.env.API_URI || 'https://your-default-api-uri.com';

    // Добавление доменов VK, включая login.vk.com
    const vkDomains = 'https://id.vk.com https://vk.com https://login.vk.com';

    const csp = isDev
      ? `
          default-src 'self' ${apiUri};
          script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.hcaptcha.com ${apiUri} https://accounts.google.com https://unpkg.com ${vkDomains};
          style-src 'self' 'unsafe-inline' https://*.hcaptcha.com ${apiUri} https://accounts.google.com;
          img-src 'self' data: https://*.hcaptcha.com https://*.googleusercontent.com ${vkDomains};
          connect-src 'self' https://*.hcaptcha.com ${apiUri} ${vkDomains};
          font-src 'self' https://*.hcaptcha.com;
          object-src 'none';
          frame-src https://*.hcaptcha.com ${vkDomains};
        `
      : `
          default-src 'self' https://your-production-domain.com;
          script-src 'self' 'unsafe-inline' https://*.hcaptcha.com https://accounts.google.com https://unpkg.com ${vkDomains};
          style-src 'self' 'unsafe-inline' https://*.hcaptcha.com https://accounts.google.com;
          img-src 'self' data: https://*.hcaptcha.com https://*.googleusercontent.com ${vkDomains};
          connect-src 'self' https://*.hcaptcha.com ${vkDomains};
          font-src 'self' https://*.hcaptcha.com;
          object-src 'none';
          frame-src https://*.hcaptcha.com ${vkDomains};
        `;

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: csp.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
          },
        ],
      },
    ];
  },

  images: {
    domains: ['triiiple.storage.yandexcloud.net', 'lh3.googleusercontent.com'],
  },

  env: {
    API_URI: process.env.API_URI,
    CAPTCHA_SITE_KEY: process.env.CAPTCHA_SITE_KEY,
    CAPTCHA_SECRET_KEY: process.env.CAPTCHA_SECRET_KEY,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GITHUB_ID: process.env.GITHUB_ID,
    GITHUB_SECRET: process.env.GITHUB_SECRET,
    DISCORD_ID: process.env.DISCORD_ID,
    DISCORD_SECRET: process.env.DISCORD_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET
  },
};

export default nextConfig;
