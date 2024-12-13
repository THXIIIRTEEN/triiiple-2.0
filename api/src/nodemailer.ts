import nodemailer, { SendMailOptions, SentMessageInfo } from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.yandex.ru',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,  
        pass: process.env.EMAIL_PASS,  
    },
});

const mailer = (message: SendMailOptions): void => {
    transporter.sendMail(message, (err: Error | null, info: SentMessageInfo) => {
        if (err) {
            console.error('Error sending email:', err);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

export default mailer;
