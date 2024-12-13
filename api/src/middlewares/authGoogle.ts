import { Request, Response } from 'express';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { transliterate } from 'transliteration';
import User from '../database/schemes/users';
import { createJWTToken } from './users';
const crypto = require('crypto');
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

interface GoogleJwtPayload extends JwtPayload {
    email: string; 
    name: string;
    email_verified: boolean;
    picture: string
}

const generateRandomPassword = (length = 12) => {
    return crypto.randomBytes(length).toString('hex');
}

const convertTextToTag = (text: string) => {
    let tag = transliterate(text.replace(/\s+/g, '')).toLowerCase();
    return tag = '@' + tag;
}

const verifyToken = async (token: string) => {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload as GoogleJwtPayload;
}

export const authNewGoogleUser = async (req: Request, res: Response) => {
    try {
        const token = req.body.token;

        const payload = await verifyToken(token);

        const tag = convertTextToTag(payload.name);
        let user = await User.findOne({ email: payload.email });

        if (!user) {
            const userData = {
                email: payload.email,
                verified: payload.email_verified,
                username: payload.name,
                profile: payload.picture,
                password: generateRandomPassword(),
                tag: tag
            }
            user = new User(userData);
            user = await user.save();
        }
        const jwtToken = createJWTToken(user, req, res);
        res.status(200).json({ message: 'Авторизация прошла успешно', token: jwtToken });
    }
    catch (error) {
        console.log(error)
        res.status(400).json({error});
    }
}