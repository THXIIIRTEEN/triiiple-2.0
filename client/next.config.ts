import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    const apiUri = isDev ? 'http://localhost:3001' : 'https://your-production-api.com'; // Замените на реальный URL API
    const vkDomains = 'https://id.vk.com https://vk.com https://login.vk.com';
    const discordDomain = 'https://discord.com';

    const csp = isDev
      ? `
          default-src 'self' ${apiUri};
          script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.hcaptcha.com ${apiUri} https://accounts.google.com https://unpkg.com ${vkDomains} ${discordDomain};
          style-src 'self' 'unsafe-inline' https://*.hcaptcha.com ${apiUri} https://accounts.google.com;
          img-src 'self' data: https://*.hcaptcha.com https://*.googleusercontent.com ${vkDomains} ${discordDomain};
          connect-src 'self' https://*.hcaptcha.com ${apiUri} ${vkDomains} ${discordDomain};
          font-src 'self' https://*.hcaptcha.com;
          object-src 'none';
          frame-src https://*.hcaptcha.com ${vkDomains} ${discordDomain};
        `
      : `
          default-src 'self' https://your-production-domain.com; // Замените на ваш продакшн домен
          script-src 'self' 'unsafe-inline' https://*.hcaptcha.com https://accounts.google.com https://unpkg.com ${vkDomains} ${discordDomain};
          style-src 'self' 'unsafe-inline' https://*.hcaptcha.com https://accounts.google.com;
          img-src 'self' data: https://*.hcaptcha.com https://*.googleusercontent.com ${vkDomains} ${discordDomain};
          connect-src 'self' https://*.hcaptcha.com ${vkDomains} ${discordDomain};
          font-src 'self' https://*.hcaptcha.com;
          object-src 'none';
          frame-src https://*.hcaptcha.com ${vkDomains} ${discordDomain};
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
    domains: ['triiiple.storage.yandexcloud.net', 'lh3.googleusercontent.com'], // Замените на ваши домены для изображений
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
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },

  // Настройки для CORS
  async redirects() {
    return [
      {
        source: '/old-route',
        destination: '/new-route',
        permanent: true,
      },
    ];
  },

  // Обработка cookies и credentials
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URI}/:path*`, // Прокси для вашего API
      },
    ];
  },
};

export default nextConfig;
