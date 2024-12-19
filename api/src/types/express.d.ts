import { JwtPayload } from 'jsonwebtoken';
declare module 'express-serve-static-core' {
    interface Request {
        auth?: JwtPayload; 
        fileUrl?: string;
        userId?: string;
    }
}
