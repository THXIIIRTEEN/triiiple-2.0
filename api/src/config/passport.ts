import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as DiscordStrategy } from 'passport-discord';
import { Strategy as VKStrategy } from "passport-vkontakte";

import User from '../database/schemes/users';

import dotenv from 'dotenv';
import { convertTextToTag, generateRandomPassword } from '../utils/authorization';

dotenv.config();

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    callbackURL: `${process.env.BACKEND_URL}/auth/github/callback`,
    scope: ['user:email'],
// @ts-ignore
}, async (accessToken, refreshToken, profile, done) => {
    console.log(profile)
    let user = await User.findOne({ email: profile.emails?.[0]?.value });
    if (!user) {
        const userData = {
            email: profile.emails?.[0]?.value,
            verified: true,
            username: profile.name || profile.username,
            profile: profile.photos?.[0]?.value,
            password: generateRandomPassword(),
            tag: convertTextToTag(profile.username)
        }
        user = new User(userData);
        user = await user.save();
    };
    return done(null, user);
}));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
// @ts-ignore
}, async (accessToken, refreshToken, profile, done) => {
    let user = await User.findOne({ email: profile.emails?.[0]?.value });
    if (!user) {
        const tag = convertTextToTag(profile.displayName);
        const userData = {
            email: profile.emails?.[0]?.value,
            verified: profile.emails?.[0]?.verified,
            username: profile.displayName,
            profile: profile.photos?.[0]?.value,
            password: generateRandomPassword(),
            tag: tag
        }
        user = new User(userData);
        user = await user.save();
    };
    return done(null, user);
}));

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID!,
    clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    callbackURL: `${process.env.BACKEND_URL}/auth/discord/callback`,
// @ts-ignore
}, async (accessToken, refreshToken, profile, done) => {
    let user = await User.findOne({ email: profile.email });
    if (!user) {
        const avatarURL = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`;
        const userData = {
            email: profile.email,
            verified: profile.verified,
            username: profile.global_name,
            profile: avatarURL,
            password: generateRandomPassword(),
            tag: profile.username
        }
        user = new User(userData);
        user = await user.save();
    };
    return done(null, user);
}));

passport.use( new VKStrategy({
    clientID: process.env.VK_CLIENT_ID!, 
    clientSecret: process.env.VK_CLIENT_SECRET!,
    callbackURL: "http://localhost/auth/vk/callback",
    //@ts-ignore
    scope: ["email", "friends", "offline"], 
    profileFields: ["email", "city", "bdate"],
    display: 'page'
},  async (accessToken, refreshToken, params, profile, done) => {
        let user = await User.findOne({ email: profile.emails?.[0]?.value });
        if (!user) {
            const userData = {
                email: profile.emails?.[0]?.value,
                verified: true,
                username: profile.displayName,
                profile: profile.photos?.[0]?.value,
                password: generateRandomPassword(),
                tag: profile.username
            }
            user = new User(userData);
            user = await user.save();
        };
        return done(null, user);

}));

passport.serializeUser((user: any, done) => {
    done(null, user.id); // Сохраняем только ID пользователя в сессии
});
  
passport.deserializeUser((id: string, done) => {
// @ts-ignore
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

export default passport;
