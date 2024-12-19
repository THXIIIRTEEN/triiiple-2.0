import { Request, Response, NextFunction } from 'express';
import Users from '../database/schemes/users';
import Confirmation from '../database/schemes/confirmations';
import mailer from '../nodemailer';
import Verification from '../database/schemes/verification';
import jwtLibrary from 'jsonwebtoken';
import User from '../database/schemes/users';
import { IUser } from '../types/IUser';

const secret = process.env.SECRET_KEY as string;

interface ErrorMessage {
    name: string;
    message: string;
}

const checkIfTagExist = async (req: Request, res: Response): Promise<ErrorMessage | null> => {
    const tag: string = req.body.tag;
    const existingTag = await Users.findOne({ tag });
    if (existingTag) {
        return { name: 'tag', message: 'Пользователь с таким именем уже существует' };
    }
    return null;
};

const checkIfEmailExist = async (req: Request, res: Response): Promise<ErrorMessage | null> => {
    const email: string = req.body.email;
    const existingEmail = await Users.findOne({ email });
    if (existingEmail) {
        return { name: 'email', message: 'Пользователь с такой почтой уже существует' };
    }
    return null;
};

const createNewUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userData = {
            username: req.body.username,
            tag: req.body.tag,
            email: req.body.email,
            password: req.body.password,
        };

        const errors: ErrorMessage[] = [];

        const tagError = await checkIfTagExist(req, res);
        if (tagError) {
            errors.push(tagError);
        }

        const emailError = await checkIfEmailExist(req, res);
        if (emailError) {
            errors.push(emailError);
        }

        if (errors.length > 0) {
            res.status(400).json({ errors });
            return;
        }

        const user = new Users(userData);
        await user.save();
        res.status(200).json({ message: 'Пользователь создан успешно' });
        next();
    } catch (error) {
        console.log(`Возникла ошибка при создании пользователя: ${error}`);
        res.status(400).json({ message: `Возникла ошибка при создании пользователя: ${error}` });
    }
};

const generateConfirmationToken = async (email: string): Promise<string> => {
    const confirmationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const confirmation = new Confirmation({ email, token: confirmationToken });

    await confirmation.save();
    return confirmationToken;
};

const generateVerificationCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendEmailConfirmation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const confirmationToken = await generateConfirmationToken(req.body.email);
    const message = {
        from: process.env.EMAIL_USER,
        to: req.body.email,
        subject: 'Registration Confirmation',
        text: `Please confirm your registration by clicking the following link: ${process.env.BACKEND_URL}/verify/${req.body.username}/${confirmationToken}`,
    };
    mailer(message);
    next();
};

const sendEmailConfirmationAuthorization = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const code = generateVerificationCode();
    const email = req.body.email;

    const verification = new Verification({ email, code });
    await verification.save();

    const message = {
        from: process.env.EMAIL_USER,
        to: req.body.email,
        subject: 'Код подтверждения',
        text: `Ваш код подтверждения: ${code}`,
    };
    mailer(message);
    next();
};

const checkAuthorizedUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const email: string = req.body.email;
    const password: string = req.body.password;

    const user = await Users.findOne({ email });
    const errors: ErrorMessage[] = [];

    if (!user) {
        errors.push({ name: 'email', message: 'Неправильная почта или пароль' });
    } else if (user.verified === false) {
        errors.push({ name: 'email', message: 'Эта почта ещё не верифицирована, пожалуйста проверьте ваш электронный почтовый ящик' });
    } else {
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            errors.push({ name: 'password', message: 'Неправильная почта или пароль' });
        }
    }

    if (errors.length > 0) {
        res.status(400).json({ errors });
        return;
    }

    if (user) {
        res.status(200).json({ message: 'Авторизация прошла успешно' });
        next();
    }
};

export const createJWTToken = (user: IUser, req: Request, res: Response) => {
    const payload = {
        id: user._id,
        email: user.email,
        username: user.username,
        tag: user.tag,
    };
    const token = jwtLibrary.sign(payload, secret, { expiresIn: '30d' });
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'none', maxAge: 3600000 * 24 * 30 });

    return token;
}

const verifyCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const code: string = req.body.code;
    const email: string = req.body.email;

    const existingCode = await Verification.findOne({ code, email });
    const user = await User.findOne({ email: email });

    if (existingCode && user) {
        await Verification.findByIdAndDelete(existingCode._id);
        const token = createJWTToken(user, req, res);
        res.status(200).json({ message: 'Аутентификация прошла успешно', token: token });
    } else {
        res.status(400).json({ message: 'Неверный код пользователя' });
    }
};

export {
    createNewUser,
    sendEmailConfirmation,
    checkAuthorizedUser,
    sendEmailConfirmationAuthorization,
    verifyCode,
    generateConfirmationToken,
};
