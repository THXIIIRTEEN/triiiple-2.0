import { Request, Response, NextFunction } from 'express';

function cors(req: Request, res: Response, next: NextFunction): void {
  const allowedCors: string[] = [
    'https://triiiple.ru',
    process.env.FRONTEND_URL || 'https://test.mydomain.com',
  ];

  const origin = req.headers.origin;

  if (origin && allowedCors.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    console.warn(`CORS: blocked origin ${origin}`);
  }

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
}

export default cors;
