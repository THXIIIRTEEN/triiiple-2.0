const captchaRouter = require('express').Router();
const axios = require('axios');
const qs = require('qs'); 

captchaRouter.post('/captcha', async (req, res) => {
    const { token } = req.body;
    const secretKey = process.env.CAPTCHA_SECRET_KEY;

    if (!token || !secretKey) {
        return res.status(400).json({
            success: false,
            message: 'Ошибка верификации капчи'
        });
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

module.exports = captchaRouter;
