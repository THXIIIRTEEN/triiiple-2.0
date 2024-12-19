import { Request, Response, Router } from 'express';
import passport from 'passport';
import { createJWTToken } from '../middlewares/users';
import { IUser } from '../types/IUser';

const oauthRouter = Router();

const callbackRedirectFunction = (req: Request, res: Response ) => {
    const user = req.user as IUser
    if (user) {
        const token = createJWTToken(user, req, res);
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    }
    else {
        res.status(400).send('Authentication failed')
    }
}

oauthRouter.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
oauthRouter.get('/github/callback', passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    callbackRedirectFunction(req, res);
  }
);

oauthRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
oauthRouter.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    callbackRedirectFunction(req, res);
  }
);

oauthRouter.get('/discord', passport.authenticate('discord', { scope: ['identify', 'email'] }));
oauthRouter.get('/discord/callback', passport.authenticate('discord', { failureRedirect: '/' }),
  (req, res) => {
    callbackRedirectFunction(req, res);
  }
);
//@ts-ignore
oauthRouter.get('/vk', passport.authenticate('vkontakte', {scope: ["status", "email", "friends", "notify"]}));
oauthRouter.get('/vk/callback', passport.authenticate('vkontakte', { failureRedirect: '/' }),
  (req, res) => {
    callbackRedirectFunction(req, res);
  }
);

export default oauthRouter;
