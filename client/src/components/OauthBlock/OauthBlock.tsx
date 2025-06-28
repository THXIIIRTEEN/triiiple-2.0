import OauthButton from "@/components/OauthButton/OauthButton";
import styles from "./OauthBlock.module.scss"

const OauthBlock: React.FC = () => {
    const vkLink = 
    `https://oauth.vk.com/authorize` +
    `?client_id=${process.env.NEXT_PUBLIC_VK_CLIENT_ID}` +
    `&display=popup` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent('https://api.triiiple.ru/auth/vk/callback')}` +
    `&scope=email,friends,offline`;
    return (
        <>
            <div className={styles.container}>
                <h2 className={styles.title}>Авторизация</h2>
                <OauthButton text="Продолжить с Google" link="/auth/google" style="google"/>
                {/* <OauthButton text="Продолжить с Discord" link="/auth/discord" style="discord"/> */}
                <OauthButton text="Продолжить с GitHub" link="/auth/github" style="github"/> 
                <OauthButton text="Продолжить с VK" link={vkLink} style="vk" />
            </div>
        </>
    )
};

export default OauthBlock;