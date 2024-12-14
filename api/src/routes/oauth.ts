import express from 'express';
import passport from 'passport';

const oauthRouter = express.Router();

oauthRouter.get('/auth/discord', passport.authenticate('discord', { scope: ['identify email'] }));

oauthRouter.get('/auth/discord/callback', passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/profile`);
});

oauthRouter.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

oauthRouter.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/profile`);
});

export default oauthRouter;
