import { Request, Response, NextFunction } from 'express';

function cors(req: Request, res: Response, next: NextFunction): void {
    const allowedCors: string[] = [
        process.env.FRONTEND_URL || ''
    ];

    const { origin } = req.headers;

    if (origin && allowedCors.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    next();
}

export default cors;
