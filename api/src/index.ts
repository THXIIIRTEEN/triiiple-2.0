import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import connectToDatabase from './database/connect';
import cors from './middlewares/cors';
import { userRouter } from './routes/users';
import { confirmationRouter } from './routes/confirmations';
import { passwordRouter } from './routes/password';
import oauthRouter from './routes/oauth';
import captchaRouter from './routes/captcha';
import passport from './config/passport';
import protectedRouter from './routes/protected';
import chatRouter from './routes/chat';
import messangerRouter from './routes/messanger';
import http from 'http';
import { initSocket } from './config/socket';
import postRouter from './routes/posts';
import path from 'path';

const secret = process.env.SECRET_KEY || 'default_secret';  
const port = process.env.NODE_ENV === 'production' ? 3001 : 80;

const app = express();
const server = http.createServer(app);

app.use(cors);

connectToDatabase();
initSocket(server);

app.use(
  bodyParser.json(),
  protectedRouter,
  userRouter,
  confirmationRouter,
  captchaRouter,
  passwordRouter,
  chatRouter,
  messangerRouter,
  postRouter
);

app.use(
  session({
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production',  
      httpOnly: true,  
      sameSite: 'strict',  
      maxAge: 1000 * 60 * 60 * 24 * 30,  
    },
  })
);

app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.use('/auth', oauthRouter);

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
