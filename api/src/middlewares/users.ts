import { Request, Response, NextFunction } from 'express';
import Users from '../database/schemes/users';
import Confirmation from '../database/schemes/confirmations';
import mailer from '../nodemailer';
import Verification from '../database/schemes/verification';
import jwtLibrary from 'jsonwebtoken';
import User from '../database/schemes/users';
import { IUser } from '../types/IUser';
import { CustomRequest } from '../types/requests';
import mongoose from 'mongoose';

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

const createNewUser = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
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
        const userId = await user.save() as IUser;
        req.userId = userId._id as string;
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

const sendEmailConfirmation = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    const confirmationToken = await generateConfirmationToken(req.body.email);
    const message = {
        from: process.env.EMAIL_USER,
        to: req.body.email,
        subject: 'Registration Confirmation',
        text: `Please confirm your registration by clicking the following link: ${process.env.BACKEND_URL}/verify/${req.body.username}/${confirmationToken}`,
    };
    mailer(message);
    const userId = req.userId
    res.status(200).json({ userId });
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
        res.status(200).json({ message: 'Аутентификация прошла успешно', token: token, userId: user._id });
    } else {
        res.status(400).json({ message: 'Неверный код пользователя' });
    }
};

export const handleGetProfile = async (req: Request, res: Response) => {
    try {
        const { profileId, userId } = req.body;
        const user = await User.findById(profileId)
            .select("username profile tag email")
            .lean();
        const userFull = await User.findById(profileId);
        if (user && userFull) {
            const isPending = userFull.requests?.some(id => id.toString() === userId);
            const isFriend = userFull.friends?.some(id => id.toString() === userId);
            user.friendStatus = isPending ? 'pending' : isFriend || false;
        }
        res.status(200).json({ user });
    }
    catch (error) {
        console.error(error)
    }
}

interface IFriendData {
    userId: string;
    friendId: string;
    action?: boolean;
}

export const handleAddFriend = async (data: IFriendData) => {
    try {
        const { userId, friendId } = data;
        const friend = await User.findById(friendId);
        const user = await User.findById(userId);

        if (!user || !friend) return null;
    
        const isFriend = user.friends?.some(id => id.toString() === friendId);
        const hasRequest = user.requests?.some(id => id.toString() === userId);
        const friendHasRequest = friend.requests?.some(id => id.toString() === userId);
        // Отправляем или отзываем запрос в друзья
        if (!isFriend && !hasRequest) {
            if (!friendHasRequest) {
            await User.findByIdAndUpdate(friendId, { $push: { requests: new mongoose.Types.ObjectId(userId) } });
            return "pending";
            } else {
            await User.findByIdAndUpdate(friendId, { $pull: { requests: new mongoose.Types.ObjectId(userId) } });
            return false;
            }
        }
        // Удаление из друзей
        if (isFriend && !hasRequest) {
            await User.findByIdAndUpdate(friendId, { $pull: { friends: new mongoose.Types.ObjectId(userId) } });
            await User.findByIdAndUpdate(userId, { $pull: { friends: new mongoose.Types.ObjectId(friendId) } });
            return false;
        }
        return null;
    } catch (error) {
      console.error(error);
      return null;
    }
};

export const handleGetRequest = async (req: Request, res: Response) => {
    const { userId, profileId } = req.body;
    const profile = await User.findById(userId);
    if (!profile) {
        res.status(400).json({ message: `Пользователь не найден` });
        return;
    }
    const hasRequest = profile.requests?.some(id => id.toString() === profileId);
    res.status(200).json({ hasRequest });
}

export const handleRequestAction = async (data: IFriendData) => {
    const { userId, friendId, action } = data;

    if (action) {
        await User.findByIdAndUpdate(userId, {$pull: { requests: new mongoose.Types.ObjectId(friendId) }});
        await User.findByIdAndUpdate(userId, {$push: { friends: new mongoose.Types.ObjectId(friendId) }});
        await User.findByIdAndUpdate(friendId, {$push: { friends: new mongoose.Types.ObjectId(userId) }});
        return true;
    }
    if (!action) {
        await User.findByIdAndUpdate(userId, {$pull: { requests: new mongoose.Types.ObjectId(friendId) }})
        return false;
    }
}

export const handleEditUserData = async (req: Request, res: Response) => {
    try {
        const { userId, name, value } = req.body;
        const errors: ErrorMessage[] = [];

        if (name === 'username') {
            const user = await User.findByIdAndUpdate(userId, { $set: { [name]: value} }, { new: true }).select(`${name}`);
            const userFull = await User.findById(userId);
            if (user && userFull) {
                const token = createJWTToken(userFull, req, res)        
                res.status(200).json({ user, token });
            };
        }
        if (name === 'tag') {
            const tag = await User.findOne({ tag: new RegExp(`^${value}$`, 'i') });
            if (tag) {
                errors.push({ name: 'tag', message: 'Пользователь с таким тэгом уже существует' });
            }
            if (errors.length > 0) {
                res.status(400).json({ errors });
                return;
            }
            const user = await User.findByIdAndUpdate(userId, { $set: { [name]: value} }, { new: true }).select(`${name}`);
            const userFull = await User.findById(userId);
            if (user && userFull) {
                const token = createJWTToken(userFull, req, res)        
                res.status(200).json({ user, token });
            };
        }
    }
    catch (error) {
        console.error(error)
    }
};

interface IAboutUserData {
    author: string;
    text: string
};

export const handleEditAboutMe = async (data: IAboutUserData) => {
    const { author, text } = data;
    const user = await User.findByIdAndUpdate(author, { $set: { about_user: text} }, { new: true }).select("about_user");
    return user;
};

export const fetchUserAboutMe = async (req: Request, res: Response) => {
    const { userId } = req.body;
    const user = await User.findById(userId).select("about_user");
    if (user) {
        res.status(200).json({ about_user: user?.about_user});
    }
}

export {
    createNewUser,
    sendEmailConfirmation,
    checkAuthorizedUser,
    sendEmailConfirmationAuthorization,
    verifyCode,
    generateConfirmationToken
};
