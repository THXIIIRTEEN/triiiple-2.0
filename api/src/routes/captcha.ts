import express, { Request, Response } from 'express';
import axios from 'axios';
import qs from 'qs';

const captchaRouter = express.Router();

captchaRouter.post('/captcha', async (req: Request, res: Response): Promise<void> => {
    const { token } = req.body;
    const secretKey = process.env.CAPTCHA_SECRET_KEY;

    if (!token || !secretKey) {
        res.status(400).json({
            success: false,
            message: 'Ошибка верификации капчи'
        });
        return; 
    }

    try {
        const requestBody = qs.stringify({
            secret: secretKey,
            response: token
        });

        const response = await axios.post('https://hcaptcha.com/siteverify', requestBody, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        if (response.data.success) {
            res.status(200).json({ success: true });
        } else {
            res.status(400).json({
                success: false,
                message: 'Ошибка верификации капчи',
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

export default captchaRouter;
