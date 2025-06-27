import { Request, Response, NextFunction } from 'express';
import Users from '../database/schemes/users';
import Confirmations from '../database/schemes/confirmations';
import mailer from '../nodemailer';
import { generateConfirmationToken } from './users';
import { verifyCorrectSymbols } from '../utils/textValidation';

interface ForgotPasswordRequest extends Request {
    body: {
        email: string;
    };
}

interface ChangePasswordRequest extends Request {
    body: {
        password: string;
        token: string;
    };
}

const forgotPasswordSendEmail = async (req: ForgotPasswordRequest, res: Response, next: NextFunction): Promise<void> => {
    const email = req.body.email;

    try {
        const user = await Users.findOne({ email });
        const errors: { name: string; message: string }[] = [];

        if (user && user.verified === false) {
            errors.push({ name: 'email', message: 'Эта почта ещё не верифицирована, пожалуйста, проверьте ваш электронный почтовый ящик' });
        }

        if (errors.length > 0) {
            res.status(400).json({ errors });
            return;
        }
        const logoBase64 = "data:image/svg+xml;base64," + Buffer.from(
            `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="8" fill="black"/>
                <path d="M15.6283 27.856C15.6283 27.984 14.8923 28.048 13.4203 28.048C11.9643 28.048 11.2363 27.992 11.2363 27.88V16.096C11.2363 15.984 11.9643 15.928 13.4203 15.928C14.8923 15.928 15.6283 15.976 15.6283 16.072V27.856ZM15.6283 14.656C15.6283 14.768 14.8923 14.824 13.4203 14.824C11.9643 14.824 11.2363 14.776 11.2363 14.68V11.224C11.2363 11.064 11.9643 10.984 13.4203 10.984C14.8923 10.984 15.6283 11.032 15.6283 11.128V14.656ZM22.1908 27.856C22.1908 27.984 21.4548 28.048 19.9828 28.048C18.5268 28.048 17.7988 27.992 17.7988 27.88V16.096C17.7988 15.984 18.5268 15.928 19.9828 15.928C21.4548 15.928 22.1908 15.976 22.1908 16.072V27.856ZM22.1908 14.656C22.1908 14.768 21.4548 14.824 19.9828 14.824C18.5268 14.824 17.7988 14.776 17.7988 14.68V11.224C17.7988 11.064 18.5268 10.984 19.9828 10.984C21.4548 10.984 22.1908 11.032 22.1908 11.128V14.656ZM28.7533 27.856C28.7533 27.984 28.0173 28.048 26.5453 28.048C25.0893 28.048 24.3613 27.992 24.3613 27.88V16.096C24.3613 15.984 25.0893 15.928 26.5453 15.928C28.0173 15.928 28.7533 15.976 28.7533 16.072V27.856ZM28.7533 14.656C28.7533 14.768 28.0173 14.824 26.5453 14.824C25.0893 14.824 24.3613 14.776 24.3613 14.68V11.224C24.3613 11.064 25.0893 10.984 26.5453 10.984C28.0173 10.984 28.7533 11.032 28.7533 11.128V14.656Z" fill="white"/>
            </svg>`
        ).toString('base64');

        const code = await generateConfirmationToken(email);
        const message = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Смена пароля',
            text: `Инструкции по смене пароля: ${process.env.BACKEND_URL}/password/reset/${code}`,
            html: `
                <div style="
                font-family: Roboto, sans-serif; 
                color: #000; 
                text-align: center; 
                max-width: 400px; 
                margin: 0 auto;
                ">
                <img src="${logoBase64}" width="40" height="40" alt="logo" style="display: block; margin: 0 auto;" />

                <h2 style="font-size: 2rem; margin-bottom: 1rem;">Смена пароля</h2>
                <p style="font-size: 1rem; margin-bottom: 2rem;">Для сброса пароля нажмите на кнопку:</p>
                <a href="${process.env.BACKEND_URL}/password/reset/${code}" style="
                    background-color: #000;
                    border-radius: 0.625rem;
                    color: #fff;
                    padding: 0.5rem 1rem;
                    border: none;
                    text-decoration: none;
                    display: inline-block;
                    margin: 0 auto;
                    margin-bottom: 0.25rem;
                ">Сменить пароль</a>
                <p style="color: #919191; font-size: 0.625rem;">Если вы не запрашивали смену пароля, просто проигнорируйте это письмо.</p>
                </div>
            `,
        };
        mailer(message);
        res.status(200).json({ message: 'Инструкции о сбросе пароля отправлены на почту' });
    } catch (error) {
        next(error); // передаем ошибку в обработчик ошибок
    }
};

const changePassword = async (req: ChangePasswordRequest, res: Response): Promise<void> => {
    const { password, token } = req.body;

    try {
        const confirmationToken = await Confirmations.findOne({ token });

        if (confirmationToken) {
            const user = await Users.findOne({ email: confirmationToken.email });

            if (user) {
                if (verifyCorrectSymbols({ password })) {
                    user.password = password;
                    await user.save();
                    await Confirmations.findByIdAndDelete(confirmationToken._id);
                    res.status(200).json({ message: 'Пароль успешно изменён, можете закрыть это окно' });
                } else {
                    res.status(400).json({ message: 'Неверный формат пароля' });
                }
            } else {
                throw new Error('Пользователь не найден');
            }
        } else {
            throw new Error('Токен не найден');
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка';
        res.status(400).json({ message: `Произошла ошибка во время обновления пароля: ${errorMessage}` });
    }
};

export {
    forgotPasswordSendEmail,
    changePassword
};
