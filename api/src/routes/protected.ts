import { NextFunction, Request, Response, Router } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import jwtCheck from '../middlewares/jwt';

const protectedRouter = Router();

interface CustomRequest extends Request {
    auth?: JwtPayload
}

//@ts-ignore
protectedRouter.post('/protected', jwtCheck, (req: CustomRequest, res: Response, next: NextFunction) => {
    if (req.auth) {
        res.status(200).send({ message: 'This is a protected route' });
    } 
    else {
        res.status(401).send({ message: 'You are not logged in' });
    }
});

export default protectedRouter