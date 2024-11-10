import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    const apiUri = process.env.API_URI;

    const csp = isDev
      ? `
          default-src 'self' ${apiUri};
          script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.hcaptcha.com ${apiUri};
          style-src 'self' 'unsafe-inline' https://*.hcaptcha.com ${apiUri};
          img-src 'self' data: https://*.hcaptcha.com;
          connect-src 'self' https://*.hcaptcha.com ${apiUri};
          font-src 'self' https://*.hcaptcha.com;
          object-src 'none';
          frame-src https://*.hcaptcha.com;
        `
      : `
          default-src 'self' https://your-production-domain.com;
          script-src 'self' 'unsafe-inline' https://*.hcaptcha.com;
          style-src 'self' 'unsafe-inline' https://*.hcaptcha.com;
          img-src 'self' data: https://*.hcaptcha.com;
          connect-src 'self' https://*.hcaptcha.com;
          font-src 'self' https://*.hcaptcha.com;
          object-src 'none';
          frame-src https://*.hcaptcha.com;
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
  env: {
    API_URI: process.env.API_URI,
    CAPTCHA_SITE_KEY: process.env.CAPTCHA_SITE_KEY,
    CAPTCHA_SECRET_KEY: process.env.CAPTCHA_SECRET_KEY,
  },
};

export default nextConfig;
