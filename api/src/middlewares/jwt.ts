import { Request, Response, NextFunction } from 'express';
import { expressjwt as jwtMiddleware } from 'express-jwt';
import { publicRoutes } from '../routes/publicRouters';

const secretKey = process.env.SECRET_KEY;

if (!secretKey) {
    throw new Error("Секретный ключ не может быть определён");
}

const jwtCheck = jwtMiddleware({
    secret: secretKey,
    algorithms: ['HS256'],
    requestProperty: 'auth',
    getToken: (req: Request) => {
      if (req.headers['authorization'] && req.headers['authorization'].split(' ')[0] === 'Bearer') {
        return req.headers['authorization'].split(' ')[1];
      } else if (req.cookies && req.cookies.token) {
        return req.cookies.token;
      }
      return null;
    },
  }).unless({ path: publicRoutes });
  

export default jwtCheck;
