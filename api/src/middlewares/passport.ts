import passport from 'passport';
import { Strategy as VkStrategy, Profile as VKProfile } from 'passport-vkontakte';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as DiscordStrategy } from 'passport-discord';

interface OAuthProfile {
    id: string;
    displayName: string;
    emails: { value: string }[];
}

passport.use(new VkStrategy({
    clientID: process.env.VK_SECURITY_KEY!,
    clientSecret: process.env.VK_SERVICE_KEY!,
    callbackURL: `${process.env.BACKEND_URL}/auth/vk/callback`,
}, async (accessToken: string, refreshToken: string, params: any, profile: VKProfile, done: (error: any, user?: any) => void) => {
    const user = await findOrCreateUser({
        id: profile.id,
        displayName: profile.displayName,
        emails: profile.emails || []
    });
    done(null, user);
}));

// passport.use(new GitHubStrategy({
//     clientID: process.env.GITHUB_CLIENT_ID,
//     clientSecret: process.env.GITHUB_CLIENT_SECRET,
//     callbackURL: 'http://localhost:3001/auth/github/callback',
// }, async (accessToken, refreshToken, profile, done) => {
//     const user = await findOrCreateUser(profile);
//     done(null, user);
// }));

// passport.use(new DiscordStrategy({
//     clientID: process.env.DISCORD_CLIENT_ID,
//     clientSecret: process.env.DISCORD_CLIENT_SECRET,
//     callbackURL: 'http://localhost:3001/auth/discord/callback',
//     scope: ['identify', 'email'],
// }, async (accessToken, refreshToken, profile, done) => {
//     const user = await findOrCreateUser(profile);
//     done(null, user);
// }));

const findOrCreateUser = async (profile: OAuthProfile): Promise<OAuthProfile>  => {
    console.log(profile)
    return profile;
};
