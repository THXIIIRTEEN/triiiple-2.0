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

        const code = await generateConfirmationToken(email);
        const message = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Смена пароля',
            text: `Инструкции по смене пароля: ${process.env.BACKEND_URL}/password/reset/${code}`
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
