const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport(
    {
        host: 'smtp.yandex.ru',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    },
    {
        from: 'triiiple team <triiipl3@yandex.ru>'
    }
);

const mailer = message => {
    transporter.sendMail(message, (err, info) => {
        if (err) return console.log(err)
    })
}

module.exports = mailer