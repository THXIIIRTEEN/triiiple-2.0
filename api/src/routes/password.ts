import express, { Request, Response } from 'express';
import path from 'path';
import { forgotPasswordSendEmail, changePassword } from '../middlewares/password';
import Users from '../database/schemes/users';
import Confirmations from '../database/schemes/confirmations';

const passwordRouter = express.Router();

passwordRouter.post('/reset/password', forgotPasswordSendEmail);
passwordRouter.post('/reset/password/change', changePassword);

passwordRouter.get('/password/reset/:code', async (req: Request, res: Response): Promise<void> => {
    const code: string = req.params.code;

    try {
        const confirmation = await Confirmations.findOne({ token: code });
        if (confirmation) {
            const user = await Users.findOne({ email: confirmation.email });
            if (user) {
                res.sendFile(path.join(__dirname, '../public/password/index.html'));
            } else {
                res.status(400).json({ message: 'Возникла ошибка при обновлении пароля' });
            }
        } else {
            res.status(400).json({ message: 'Неверный токен для сброса пароля' });
        }
    } catch (error) {
        console.error('Ошибка при сбросе пароля:', error);
        res.status(500).json({ message: 'Произошла ошибка на сервере' });
    }
});

export { passwordRouter };
