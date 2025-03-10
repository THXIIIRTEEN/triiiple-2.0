// server.js

import fs from 'fs';
import https from 'https';
import next from 'next';

// Создаем сервер только в серверной части
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const hostname = 'test.mydomain.com'; // Настроено в файле hosts
const port = 3000;

const startServer = async () => {
  await app.prepare();

  // Убедитесь, что сертификаты находятся в нужном пути
  const httpsOptions = {
    key: fs.readFileSync('./certificates/localhost.key'), // Приватный ключ
    cert: fs.readFileSync('./certificates/localhost.crt'), // Сертификат
  };

  // Создаем HTTPS сервер
  https.createServer(httpsOptions, async (req, res) => {
    await handle(req, res);
  }).listen(port, hostname, (err) => {
    if (err) {
      console.error(err);
      throw err;
    }
    console.log(`> Ready on https://${hostname}:${port}`);
  });
};

startServer();
