import { Request, Response, NextFunction } from 'express';

function cors(req: Request, res: Response, next: NextFunction): void {
  const allowedCors: string[] = [
    process.env.FRONTEND_URL || 'http://test.mydomain.com',
  ];

  const { origin } = req.headers;

  if (origin && allowedCors.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin); // Указание источника
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE'); // Разрешаем методы
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Разрешаем заголовки
    res.setHeader('Access-Control-Allow-Credentials', 'true'); // Разрешаем cookies
  }

  // Обработка OPTIONS запросов (preflight)
  if (req.method === 'OPTIONS') {
    res.status(204).end(); // Отправляем статус успешного preflight запроса
    return;
  }

  next(); // Переход к следующему middleware
}

export default cors;
