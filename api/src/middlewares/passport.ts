import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import { DiscordProfile } from '../../@types/discord';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Profile } from 'passport';
import { IUser } from '../types/IUser';
import User from '../database/schemes/users';
import { generateRandomPassword } from './authGoogle';
interface OAuthProfile {
    id: string;
    displayName: string;
    emails: { value: string }[];
}

type VerifyCallback = (error: any, user?: any, info?: any) => void;

const getDiscordAvatarUrl = (userId: string, avatarHash: string | null, discriminator: string): string | null => {
    if (!avatarHash) {
        return null;
    }
    return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png?size=128`;
}

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_ID!,
    clientSecret: process.env.DISCORD_SECRET!,
    callbackURL: "/auth/discord/callback",
    scope: ['identify email']
}, async (accessToken: string, refreshToken: string, profile: DiscordProfile, done: VerifyCallback) => {
    let user = await User.findOne({ email: profile.email });

    if (!user) {
        const userData = {
            email: profile.email,
            verified: profile.verified,
            username: profile.global_name,
            profile: getDiscordAvatarUrl(profile.id, profile.avatar, profile.discriminator),
            password: generateRandomPassword(),
            tag: profile.username
        }
        user = new User(userData);
        user = await user.save();
    }
    return done(null, user);
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
    console.log(obj.id)
    done(null, obj);
});

const findOrCreateUser = async (profile: OAuthProfile): Promise<OAuthProfile>  => {
    console.log(profile)
    return profile;
};
