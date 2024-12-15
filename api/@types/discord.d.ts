import { Profile as PassportProfile } from 'passport';

export interface DiscordProfile extends PassportProfile {
    provider: "discord";
    username: string;
    global_name: string | null;
    locale: string;
    mfa_enabled: boolean;
    flags: number;
    public_flags: number;
    banner: string | null;
    accent_color: number | null;
    avatar: string | null;
    avatar_decoration_data: AvatarDecorationData | null;
    discriminator: string;
    verified: boolean;
    premium_type: 0 | 1 | 2 | 3;
    fetchedAt: string;
    email?: string | undefined; // requires "email" scope
    connections?: ConnectionInfo[] | undefined; // requires "connection" scope
    guilds?: GuildInfo[] | undefined; // requires "guilds" scope
}

interface AvatarDecorationData {
    sku_id: string;
    asset: string;
}

interface ConnectionInfo {
    verified: boolean;
    name: string;
    show_activity: boolean;
    type: string;
    id: string;
    visibility: number;
}

interface GuildInfo {
    owner: boolean;
    permissions: number;
    icon: string | null;
    banner: string | null;
    id: string;
    name: string;
    features?: string[] | undefined;
}
