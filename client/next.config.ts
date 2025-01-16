import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    const apiUri = isDev ? 'http://localhost:80' : process.env.API_URI;
    const vkDomains = 'https://id.vk.com https://vk.com https://login.vk.com';
    const discordDomain = 'https://discord.com';
    const websocketUri = isDev ? 'ws://localhost:80' : process.env.WEBSOCKET_URL;
    const cdnJsdelivr = 'https://cdn.jsdelivr.net';
    const yandexCloudDomain = 'https://triiiple.storage.yandexcloud.net';

    const csp = isDev
      ? `
          default-src 'self' ${apiUri};
          script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.hcaptcha.com ${apiUri} https://accounts.google.com https://unpkg.com ${vkDomains} ${discordDomain};
          style-src 'self' 'unsafe-inline' https://*.hcaptcha.com ${apiUri} https://accounts.google.com;
          img-src 'self' data: https://*.hcaptcha.com https://*.googleusercontent.com https://twemoji.maxcdn.com ${vkDomains} ${discordDomain} ${cdnJsdelivr};
          connect-src 'self' https://*.hcaptcha.com ${apiUri} ${vkDomains} ${discordDomain} ${websocketUri};
          font-src 'self' https://*.hcaptcha.com;
          object-src 'none';
          frame-src https://*.hcaptcha.com ${vkDomains} ${discordDomain};
          media-src 'self' ${yandexCloudDomain};
        `
      : `
          default-src 'self' https://your-production-domain.com; // Замените на ваш продакшн домен
          script-src 'self' 'unsafe-inline' https://*.hcaptcha.com https://accounts.google.com https://unpkg.com ${vkDomains} ${discordDomain};
          style-src 'self' 'unsafe-inline' https://*.hcaptcha.com https://accounts.google.com;
          img-src 'self' data: https://*.hcaptcha.com https://*.googleusercontent.com https://twemoji.maxcdn.com ${vkDomains} ${discordDomain} ${cdnJsdelivr};
          connect-src 'self' https://*.hcaptcha.com ${vkDomains} ${discordDomain};
          font-src 'self' https://*.hcaptcha.com;
          object-src 'none';
          frame-src https://*.hcaptcha.com ${vkDomains} ${discordDomain};
          media-src 'self' ${yandexCloudDomain};
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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'triiiple.storage.yandexcloud.net',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'sun1-97.userapi.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
      },
      {
        protocol: 'https',
        hostname: 'twemoji.maxcdn.com'
      }
    ],
  },

  env: {
    API_URI: process.env.API_URI,
    WEBSOCKET_URL: process.env.WEBSOCKET_URL,
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

  async redirects() {
    return [
      {
        source: '/old-route',
        destination: '/new-route',
        permanent: true,
      }
    ];
  },

  async rewrites() {
    return [
      {
        source: '/auth/:path*',
        destination: 'http://localhost:3000/auth/:path*'
      },
    ];
  },
};

export default nextConfig;
