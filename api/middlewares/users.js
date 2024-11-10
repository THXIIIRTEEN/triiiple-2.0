const Users = require('../database/schemes/users');
const Confirmation = require('../database/schemes/confirmations');
const mailer = require('../nodemailer');
const Verification = require('../database/schemes/verification');

const checkIfTagExist = async (req, res) => {
    const tag = req.body.tag;
    const existingTag = await Users.findOne({ tag });
    if (existingTag) {
        return { name: 'tag', message: 'Пользователь с таким именем уже существует' };
    }
    return null;
};

const checkIfEmailExist = async (req, res) => {
    const email = req.body.email;
    const existingEmail = await Users.findOne({ email });
    if (existingEmail) {
        return { name: 'email', message: 'Пользователь с такой почтой уже существует' };
    }
    return null;
};

const createNewUser = async (req, res, next) => {
    try {
        const userData = {
            username: req.body.username,
            tag: req.body.tag,
            email: req.body.email,
            password: req.body.password,
        };

        const errors = [];

        const tagError = await checkIfTagExist(req, res);
        if (tagError) {
            errors.push(tagError);
        }

        const emailError = await checkIfEmailExist(req, res);
        if (emailError) {
            errors.push(emailError);
        }

        if (errors.length > 0) {
            return res.status(400).send(JSON.stringify({ errors }));
        }

        const user = new Users(userData);
        await user.save();
        res.status(200).send(JSON.stringify({ message: 'Пользователь создан успешно' }));
        next();
    } catch (error) {
        console.log(`Возникла ошибка при создании пользователя: ${error}`);
        res.status(400).send(JSON.stringify({ message: `Возникла ошибка при создании пользователя: ${error}` }));
    }
};

const generateConfirmationToken = async(email) => {
    const confirmationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const confirmation = new Confirmation({ email, token: confirmationToken });

    await confirmation.save();
    return confirmationToken;
}

const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendEmailConfirmation = async (req, res, next) => {
    const confirmationToken = await generateConfirmationToken(req.body.email);
    const message = {
        to: req.body.email,
        subject: 'Registration Confirmation',
        text: `Please confirm your registration by clicking the following link: ${process.env.BACKEND_URL}/verify/${req.body.username}/${confirmationToken}`
    };
    mailer(message);
}

const sendEmailConfirmationAuthorization = async (req, res, next) => {
    const code = generateVerificationCode(req.body.email);
    const email = req.body.email

    const verification = new Verification({email, code});

    await verification.save();

    const message = {
        to: req.body.email,
        subject: 'Код подтверждения',
        text: `Ваш код подтверждения: ${code}`
    };
    mailer(message);
}

const checkAuthorizedUser = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    const user = await Users.findOne({ email });
    const errors = [];

    if (user.verified === false) {
        errors.push({ name: 'email', message: 'Эта почта ещё не верифицирована, пожалуйста проверьте ваш электронный почтовый ящик' });
    }
    if (!user) {
        errors.push({ name: 'email', message: 'Неправильная почта или пароль' });
    }
    const isMatch = await user?.comparePassword(password);
    if (!isMatch) {
        errors.push({ name: 'password', message: 'Неправильная почта или пароль' });
    }

    if (errors.length > 0) {
        return res.status(400).send(JSON.stringify({ errors }));
    }

    res.status(200).json({ message: 'Аутентификация прошла успешно' });
    next();
}

const verifyCode = async (req, res, next) => {
    const code = req.body.code;
    const email = req.body.email;

    const existingCode = await Verification.findOne({code, email});

    if (existingCode) {
        await Verification.findByIdAndDelete(existingCode._id);
        res.status(200).json({ message: 'Аутентификация прошла успешно' });
    }
    else {
        res.status(400).send(JSON.stringify({ message: `Неверный код пользователя` }));
    }
}

module.exports = {
    createNewUser,
    sendEmailConfirmation,
    checkAuthorizedUser,
    sendEmailConfirmationAuthorization,
    verifyCode,
    generateConfirmationToken
};