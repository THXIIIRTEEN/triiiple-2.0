const path = require('path');
const express = require('express');
const passwordRouter = express.Router();
const Users = require('../database/schemes/users');
const Confirmations = require('../database/schemes/confirmations');
const { forgotPasswordSendEmail, changePassword } = require('../middlewares/password');

passwordRouter.post('/reset/password', forgotPasswordSendEmail);
passwordRouter.post('/reset/password/change', changePassword);

passwordRouter.get('/password/reset/:code', async (req, res) => {
    const code = req.params.code;

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

module.exports = {
    passwordRouter
};
