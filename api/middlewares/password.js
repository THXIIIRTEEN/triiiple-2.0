const Users = require('../database/schemes/users');
const Confirmations = require('../database/schemes/confirmations');
const mailer = require('../nodemailer');
const { generateConfirmationToken } = require('./users')

const forgotPasswordSendEmail = async (req, res, next) => {
    const email = req.body.email;

    const user = await Users.findOne({ email });
    const errors = [];

    if (user.verified === false) {
        errors.push({ name: 'email', message: 'Эта почта ещё не верифицирована, пожалуйста проверьте ваш электронный почтовый ящик' });
    }
    if (errors.length > 0) {
        return res.status(400).send(JSON.stringify({ errors }));
    }

    const code = await generateConfirmationToken(email);
    const message = {
        to: email,
        subject: 'Смена пароля',
        text: `Инструкции по смене пароля: ${process.env.BACKEND_URL}/password/reset/${code}`
    };
    mailer(message);
    res.status(200).json({ message: 'Инструкции о сбросе пароля отправлены на почту' });
}

const changePassword = async (req, res) => {
    const password = req.body.password;
    const token = req.body.token;
    
    try {
        const confirmationToken = await Confirmations.findOne({token: token});

        if (confirmationToken) {
            const user = await Users.findOne({email: confirmationToken.email});
            if (user) {
                user.password = password;
                await user.save();
                await Confirmations.findByIdAndDelete(confirmationToken._id);
            }
            else {
                throw new Error('Пользователь не найден');
            }
        }
        else {
            throw new Error('Токен не найден');
        }
    }

    catch(error) {
        res.status(400).json({message: `Произошла ошибка во время обновления пароля: ${error}`})
    }
}

module.exports = {
    forgotPasswordSendEmail,
    changePassword
};