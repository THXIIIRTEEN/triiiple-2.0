import OauthButton from "@/components/OauthButton/OauthButton";
import styles from "./OauthBlock.module.scss"

const OauthBlock: React.FC = () => {
    return (
        <>
            <div className={styles.container}>
                <h2 className={styles.title}>Авторизация</h2>
                <OauthButton text="Продолжить с Google" link="/auth/google" style="google"/>
                {/* <OauthButton text="Продолжить с Discord" link="/auth/discord" style="discord"/> */}
                <OauthButton text="Продолжить с GitHub" link="/auth/github" style="github"/> 
                <OauthButton text="Продолжить с VK" link="/auth/vk" style="vk"/>
            </div>
        </>
    )
};

export default OauthBlock;