import { Request, Response, NextFunction } from 'express';
import Users from '../database/schemes/users';
import Confirmation from '../database/schemes/confirmations';
import mailer from '../nodemailer';
import Verification from '../database/schemes/verification';
import jwtLibrary from 'jsonwebtoken';
import User from '../database/schemes/users';
import { IUser } from '../types/IUser';
import { CustomRequest } from '../types/requests';
import mongoose, { ObjectId } from 'mongoose';
import bcrypt from 'bcryptjs';
import Fuse from 'fuse.js';
import { encryptData, decryptData } from '../utils/crypto';
import Notifications from '../database/schemes/notifications';
import { decryptText } from './posts';


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

const generateConfirmationToken = async (email: string, tempData?: string): Promise<string> => {
    const confirmationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const confirmation = new Confirmation({ email, token: confirmationToken, tempData });

    await confirmation.save();
    return confirmationToken;
};

const generateVerificationCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const logoBase64 = "data:image/svg+xml;base64," + Buffer.from(
    `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="black"/>
        <path d="M15.6283 27.856C15.6283 27.984 14.8923 28.048 13.4203 28.048C11.9643 28.048 11.2363 27.992 11.2363 27.88V16.096C11.2363 15.984 11.9643 15.928 13.4203 15.928C14.8923 15.928 15.6283 15.976 15.6283 16.072V27.856ZM15.6283 14.656C15.6283 14.768 14.8923 14.824 13.4203 14.824C11.9643 14.824 11.2363 14.776 11.2363 14.68V11.224C11.2363 11.064 11.9643 10.984 13.4203 10.984C14.8923 10.984 15.6283 11.032 15.6283 11.128V14.656ZM22.1908 27.856C22.1908 27.984 21.4548 28.048 19.9828 28.048C18.5268 28.048 17.7988 27.992 17.7988 27.88V16.096C17.7988 15.984 18.5268 15.928 19.9828 15.928C21.4548 15.928 22.1908 15.976 22.1908 16.072V27.856ZM22.1908 14.656C22.1908 14.768 21.4548 14.824 19.9828 14.824C18.5268 14.824 17.7988 14.776 17.7988 14.68V11.224C17.7988 11.064 18.5268 10.984 19.9828 10.984C21.4548 10.984 22.1908 11.032 22.1908 11.128V14.656ZM28.7533 27.856C28.7533 27.984 28.0173 28.048 26.5453 28.048C25.0893 28.048 24.3613 27.992 24.3613 27.88V16.096C24.3613 15.984 25.0893 15.928 26.5453 15.928C28.0173 15.928 28.7533 15.976 28.7533 16.072V27.856ZM28.7533 14.656C28.7533 14.768 28.0173 14.824 26.5453 14.824C25.0893 14.824 24.3613 14.776 24.3613 14.68V11.224C24.3613 11.064 25.0893 10.984 26.5453 10.984C28.0173 10.984 28.7533 11.032 28.7533 11.128V14.656Z" fill="white"/>
    </svg>`
).toString('base64');

const sendEmailConfirmation = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    const confirmationToken = await generateConfirmationToken(req.body.email);
    const message = {
        from: process.env.EMAIL_USER,
        to: req.body.email,
        subject: 'Подтверждение регистрации',
        text: `Пожалуйста подтвердите регистрацию перейдя по ссылке: ${process.env.BACKEND_URL}/verify/${req.body.tag}/${confirmationToken}`,
        html: `
            <div style="
            font-family: Roboto, sans-serif; 
            color: #000; 
            text-align: center; 
            max-width: 400px; 
            margin: 0 auto;
            ">
            <img src="${logoBase64}" width="40" height="40" alt="logo" style="display: block; margin: 0 auto;" />

            <h2 style="font-size: 2rem; margin-bottom: 1rem;">Подтверждение регистрации</h2>
            <p style="font-size: 1rem; margin-bottom: 2rem;">Для подтверждения регистрации нажмите на кнопку:</p>
            <a href="${process.env.BACKEND_URL}/verify/${req.body.tag}/${confirmationToken}" style="
                background-color: #000;
                border-radius: 0.625rem;
                color: #fff;
                padding: 0.5rem 1rem;
                border: none;
                text-decoration: none;
                display: inline-block;
                margin: 0 auto;
                margin-bottom: 0.25rem;
            ">Подтвердить</a>
            <p style="color: #919191; font-size: 0.625rem;">Если вы не регистрировали аккаунт в triiiple, просто проигнорируйте это письмо.</p>
            </div>
        `,
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
        html: `
            <div style="
            font-family: Roboto, sans-serif; 
            color: #000; 
            text-align: center; 
            max-width: 400px; 
            margin: 0 auto;
            ">
            <img src="${logoBase64}" width="40" height="40" alt="logo" style="display: block; margin: 0 auto;" />

            <h2 style="font-size: 2rem; margin-bottom: 1rem;">Подтверждение регистрации</h2>
            <p style="font-size: 1rem; margin-bottom: 2rem;">Ваш код подтверждения: ${code}</p>
            <p style="color: #919191; font-size: 0.625rem;">Если вы не входили в аккаунт triiiple, просто проигнорируйте это письмо.</p>
            </div>
        `,
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

    if (user) {
        await User.findByIdAndUpdate(user._id, { $set: { verified: true}});
    }
    if (existingCode && user) {
        await Verification.findByIdAndDelete(existingCode._id);
        const token = createJWTToken(user, req, res);
        res.status(200).json({ message: 'Аутентификация прошла успешно', token: token, userId: user._id });
    } 
    else {
        res.status(400).json({ message: 'Неверный код пользователя' });
    }
};

export const handleGetProfile = async (req: Request, res: Response) => {
    try {
        const { profileId, userId } = req.body;
        const user = await User.findById(profileId)
            .select("username tag")
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

export const handleGetIdByTag = async (req: Request, res: Response) => {
    try {
        const { tag } = req.body;
        const user = await User.findOne({ tag: tag })
            .select("username")       
        if (user) {
            res.status(200).json({ user });
        }
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
            await User.findByIdAndUpdate(friendId, { $pull: { friends: new mongoose.Types.ObjectId(userId) } }, );
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
        if (name === 'email') {
            const email = await User.findOne({ email: value});
            if (email) {
                errors.push({ name: 'email', message: 'Пользователь с такой электронной почтой уже существует' });
            }
            if (errors.length > 0) {
                res.status(400).json({ errors });
                return;
            }
            const user = await User.findById(userId).select('email tag');
            if (user) {
                const confirmationToken = await generateConfirmationToken(user.email, value);
                const message = {
                    from: process.env.EMAIL_USER,
                    to: user?.email,
                    subject: 'Изменение электронной почты',
                    text: `Пожалуйста подтвердите изменение электронной почты перейдя по следующей ссылке: ${process.env.BACKEND_URL}/change-email/${user.tag}/${confirmationToken}`,
                    html: `
                        <div style="
                        font-family: Roboto, sans-serif; 
                        color: #000; 
                        text-align: center; 
                        max-width: 400px; 
                        margin: 0 auto;
                        ">
                        <img src="${logoBase64}" width="40" height="40" alt="logo" style="display: block; margin: 0 auto;" />

                        <h2 style="font-size: 2rem; margin-bottom: 1rem;">Изменение электронной почты</h2>
                        <p style="font-size: 1rem; margin-bottom: 2rem;">Пожалуйста подтвердите изменение электронной почты:</p>
                        <a href="${process.env.BACKEND_URL}/change-email/${user.tag}/${confirmationToken}" style="
                            background-color: #000;
                            border-radius: 0.625rem;
                            color: #fff;
                            padding: 0.5rem 1rem;
                            border: none;
                            text-decoration: none;
                            display: inline-block;
                            margin: 0 auto;
                            margin-bottom: 0.25rem;
                        ">Подтвердить</a>
                        <p style="color: #919191; font-size: 0.625rem;">Если вы не меняли электронную почту, просто проигнорируйте это письмо.</p>
                        </div>
                    `,
                };
                mailer(message);
                    errors.push({ name: 'email', message: 'Подтвердите смену электронной почты через письмо в вашем емейле.' });
                    res.status(400).json({ errors });
            }
        }
        if (name === 'password') {
            const user = await User.findById(userId).select('email tag password');
            let { newPassword } = req.body;
            

            if (user && await user.comparePassword(value)) {
                const salt = await bcrypt.genSalt(10);
                newPassword = await bcrypt.hash(newPassword, salt); 
    
                if (user) {
                    const confirmationToken = await generateConfirmationToken(user.email, newPassword);
                    const message = {
                        from: process.env.EMAIL_USER,
                        to: user?.email,
                        subject: 'Изменение пароля',
                        text: `Пожалуйста подтвердите изменение пароля перейдя по следующей ссылке: ${process.env.BACKEND_URL}/change-password/${user.tag}/${confirmationToken}`,
                        html: `
                            <div style="
                            font-family: Roboto, sans-serif; 
                            color: #000; 
                            text-align: center; 
                            max-width: 400px; 
                            margin: 0 auto;
                            ">
                            <img src="${logoBase64}" width="40" height="40" alt="logo" style="display: block; margin: 0 auto;" />

                            <h2 style="font-size: 2rem; margin-bottom: 1rem;">Изменение пароля</h2>
                            <p style="font-size: 1rem; margin-bottom: 2rem;">Пожалуйста подтвердите изменение пароля:</p>
                            <a href="${process.env.BACKEND_URL}/change-password/${user.tag}/${confirmationToken}" style="
                                background-color: #000;
                                border-radius: 0.625rem;
                                color: #fff;
                                padding: 0.5rem 1rem;
                                border: none;
                                text-decoration: none;
                                display: inline-block;
                                margin: 0 auto;
                                margin-bottom: 0.25rem;
                            ">Подтвердить</a>
                            <p style="color: #919191; font-size: 0.625rem;">Если вы не изменяли пароль, просто проигнорируйте это письмо.</p>
                            </div>
                        `,
                    };
                    mailer(message);
                        errors.push({ name: 'password', message: 'Подтвердите смену электронной почты через письмо в вашем емейле.' });
                        res.status(400).json({ errors });
                }
            }
            else {
                errors.push({ name: 'password', message: 'Неверный пользователь или пароль' });
                res.status(400).json({ errors });
            }
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

export const isEmailVerified = async (req: Request, res: Response) => {
    const { userId } = req.body;
    const user = await User.findById(userId).select('verified');
    if (user) {
        res.status(200).json({ verified: user.verified })
    }
}

export const handleVerifyEmail = async (req: Request, res: Response) => {
    const { userId } = req.body;
    const user = await User.findById(userId).select('email');
    const errors: ErrorMessage[] = [];
    if (!user) {
        errors.push({ name: 'email', message: 'Пользователь не найден' });
        if (errors.length > 0) {
            res.status(400).json({ errors });
            return;
        }
    }
    if (user) {
        const code = generateVerificationCode();
        const email = user.email;

        const verification = new Verification({ email, code });
        await verification.save();

        const message = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Код подтверждения',
            text: `Ваш код подтверждения: ${code}`,
            html: `
                <div style="
                font-family: Roboto, sans-serif; 
                color: #000; 
                text-align: center; 
                max-width: 400px; 
                margin: 0 auto;
                ">
                <img src="${logoBase64}" width="40" height="40" alt="logo" style="display: block; margin: 0 auto;" />

                <h2 style="font-size: 2rem; margin-bottom: 1rem;">Код подтверждения</h2>
                <p style="font-size: 1rem; margin-bottom: 2rem;">Ваш код подтверждения: ${code}</p>
                <p style="color: #919191; font-size: 0.625rem;">Если вы не входили в аккаунт triiiple, просто проигнорируйте это письмо.</p>
                </div>
            `,
        };
        mailer(message);
        res.status(200).json({ message: 'Введите код подтверждения, который пришёл на вашу почту' });
    }
}

export const handleGetFriendsQuantity = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId)
            .select("friends")
            .lean();
        res.status(200).json({ friends: user?.friends?.length });
    }
    catch (error) {
        console.error(error)
    }
}

export const handleGetFriends = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId)
            .populate({
                path: "friends",
                select: "username tag friends" 
            });
        res.status(200).json({ friends: user?.friends });
    }
    catch (error) {
        console.error(error)
    }
}

export const handleGetRequests = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId)
            .populate({
                path: "requests",
                select: "username tag friends" 
            });
        res.status(200).json({ requests: user?.requests });
    }
    catch (error) {
        console.error(error)
    }
}

export const handleGetUserData = async (req: Request, res: Response) => {
    try {
        const { userId, requiredData } = req.body;
        const user = await User.findById(userId)
            .select(requiredData);
        res.status(200).json({ user });
    }
    catch (error) {
        console.error(error)
    }
}

export const handleSearch = async (req: Request, res: Response) => {
    try {
        const { name, value } = req.body;
        let rawUsers = [] as IUser[];
        
        if (name === 'users') {
            rawUsers = await User.find({}, 'username tag')
            .limit(200)
            .select('username tag friends requests')
            .lean();
        }

        if (rawUsers.length === 0) {
            res.status(200).json({ users: [] });
            return;
        }

        if (rawUsers.length > 0) {
            const fuse = new Fuse(rawUsers, {
                keys: ['username', 'tag'],
                threshold: 0.3, 
            });

            const result = fuse.search(value).map(res => res.item);
            console.log(result);

            res.status(200).json({ result });
        }
    }
    catch (error) {
        console.error(error);
    }
}

export const handleSaveNotification = async (msg: any, recipients: string[] | ObjectId[]) => {
    const { author, userId, chatId, text, date, files} = msg;
    let ciphertext = ''; 
    if (text) {
        const encrypted = await encryptData(text);
        ciphertext = encrypted.ciphertext;
    }
    const newNotification = {
        author: author ?? userId,
        chatId: chatId,
        text: ciphertext,
        date: date ? date : Date.now(),
        files: Array.isArray(files) ? files.length : 0,
        type: chatId ? "message" : "friend"
    }
    let notification = new Notifications(newNotification);
    notification = await notification.save();

    const bulkOps = recipients.map(recipient => ({
        updateOne: {
            filter: { _id: recipient },
            update: { $push: { notifications: notification._id } }
        }
    }));
    await Users.bulkWrite(bulkOps);

    notification.text = await decryptText(notification); 
    return await notification.populate({
        path: 'author',
        select: 'username tag'
    });
}

export const handleGetNotifications = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body; 
        const user = await User.findById(userId).select('notifications');
        
        if (user) {
            let notifications = await Notifications.find({
                _id: { $in: user.notifications }
            }).populate('author', 'username tag');
            if (notifications && notifications.length > 0) {
                notifications = await Promise.all(
                notifications.map(async (notification: any) => {
                    let text = '';
                    if (notification.text) {
                        const { plaintext } = await decryptData(notification.text);
                        text = Buffer.from(plaintext, 'base64').toString('utf-8');
                    }

                    return {
                        ...notification.toObject(),
                        text
                    };
                })
            );
            }
            res.status(200).json({ notifications });
        }
        else {
            res.status(400).json({ message: 'Пользователь не найден' });    
        }
    }
    catch (error) {
        console.log(error)
    }
}

export const handleReadNotification = async (notificationId: string) => {
    const msg = await Notifications.findByIdAndUpdate(notificationId, { isRead: true });
    return msg;
}

export const handleDeleteNotification = async (userId: string, notificationId: string) => {
    const msg = await Notifications.findByIdAndDelete(notificationId);
    await Users.findByIdAndUpdate(
        userId,
        { $pull: { notifications: notificationId } },
        { new: true }
    );
    return msg;
}

export {
    createNewUser,
    sendEmailConfirmation,
    checkAuthorizedUser,
    sendEmailConfirmationAuthorization,
    verifyCode,
    generateConfirmationToken
};
