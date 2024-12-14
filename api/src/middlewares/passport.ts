import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Profile } from 'passport';
import { IUser } from '../types/IUser';

interface OAuthProfile {
    id: string;
    displayName: string;
    emails: { value: string }[];
}

type VerifyCallback = (error: any, user?: any, info?: any) => void;

const createOauthUser = (profile: Profile) => {

}

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_ID!,
    clientSecret: process.env.DISCORD_SECRET!,
    callbackURL: "/auth/discord/callback",
    scope: ['identify email']
}, (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
    console.log(profile)
    return done(null, profile);
}));

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_ID!,
    clientSecret: process.env.GITHUB_SECRET!,
    callbackURL: "/auth/github/callback",
    scope: ['user:email']
}, (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
    console.log(profile)
    return done(null, profile);
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj: IUser, done) => {
    done(null, obj);
});

const findOrCreateUser = async (profile: OAuthProfile): Promise<OAuthProfile>  => {
    console.log(profile)
    return profile;
};
