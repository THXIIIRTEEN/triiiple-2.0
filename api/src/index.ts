import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { expressjwt as jwtMiddleware } from 'express-jwt';
import connectToDatabase from './database/connect';
import cors from './middlewares/cors';
import { userRouter } from './routes/users';
import { confirmationRouter } from './routes/confirmations';
import { passwordRouter } from './routes/password';
import oauthRouter from './routes/oauth';
import captchaRouter from './routes/captcha';
import jwtCheck from './middlewares/jwt';
import passport from 'passport';
import './middlewares/passport'

const app = express();
const port = 3001;

const secret = process.env.SECRET_KEY || 'default_secret';  

connectToDatabase();

app.use(express.static('public'));
app.use(cookieParser());

app.use(
  jwtCheck.unless({
    path: [
      '/users/login',
      '/users/registration',
      '/public',
      '/',
      '/captcha',
      '/verify/:username/:token',
      '/users/verification',
      '/google/auth',
      '/auth/vk',
      '/auth/discord',
      '/auth/github',
      '/auth/discord/callback',
      '/auth/github/callback',
    ],
  })
);

app.use(
  session({
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors,
  bodyParser.json(),
  userRouter,
  confirmationRouter,
  captchaRouter,
  passwordRouter,
  oauthRouter
);

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

app.get('/protected', (req: Request, res: Response) => {
  if ((req.session as any).userId) {
    res.send({ message: 'This is a protected route' });
  } else {
    res.status(401).send({ message: 'You are not logged in' });
  }
});

app.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err: Error) => {
    if (err) {
      return res.send('Error logging out');
    }
    res.send({ message: 'Logout successful' });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
