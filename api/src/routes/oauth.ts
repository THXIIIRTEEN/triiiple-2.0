import express, { Request, Response } from 'express';
import passport from 'passport';
import { createJWTToken } from '../middlewares/users';
import { IUser } from '../types/IUser';

const oauthRouter = express.Router();

oauthRouter.get('/auth/discord', passport.authenticate('discord', { scope: ['identify email'] }));

oauthRouter.get('/auth/discord/callback', 
    passport.authenticate('discord', { failureRedirect: '/' }), 
    (req: Request, res: Response) => {
      const user = req.user as IUser;
      const jwtToken = createJWTToken(user, req, res);
      console.log(jwtToken)
      res.cookie('token', jwtToken, {
        httpOnly: true,   // Защищает от доступа через JS
        secure: process.env.NODE_ENV === 'production', // Работает только через HTTPS в продакшн
        sameSite: 'none', // Разрешает кросс-доменные запросы
        path: '/',        // Доступно на всех страницах
    });
      res.redirect(`${process.env.FRONTEND_URL}/profile`);
    }
  );

oauthRouter.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

oauthRouter.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/profile`);
});

export default oauthRouter;
