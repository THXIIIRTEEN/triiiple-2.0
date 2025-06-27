import Link from "next/link";
import styles from "./OauthButton.module.scss" ;
import GoogleIcon from "@/assets/google-logo-search-new-svgrepo-com.svg"
import DiscordIcon from "@/assets/discord-icon-svgrepo-com.svg"
import GitHubIcon from "@/assets/github-142-svgrepo-com.svg"
import VKIcon from "@/assets/vk-svgrepo-com.svg"
interface OauthButtonProps {
    text: string;
    link: string;
    style: string
};

const OauthButton: React.FC<OauthButtonProps> = ({ text, link, style }) => {
    return (
        <Link href={link} className={`${styles.link} ${styles.button}`}>
            {   style === 'google' &&
                <GoogleIcon className={styles.icon}/>
            }
            {   style === 'discord' &&
                <DiscordIcon className={styles.icon}/>
            }
            {   style === 'github' &&
                <GitHubIcon className={styles.icon}/>
            }
            {   style === 'vk' &&
                <VKIcon className={styles.icon}/>
            }
            {text}
        </Link>
    )
};

export default OauthButton;