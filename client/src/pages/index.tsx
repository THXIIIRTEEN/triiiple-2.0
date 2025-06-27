import styles from "./styles/index.module.scss"
import Logo from "@/assets/Logo.svg"
import { getToken } from "@/utils/cookies";
import { useAuthStore } from "@/utils/store";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Index: React.FC = () => {

    const token = getToken();
    const router = useRouter();
    const user = useAuthStore().user;

    useEffect(() => {
        if (token && user) {
            router.push(`/profile/${user.tag}`);
        }
    }, [token, router, user]);

    return (
        <>
            <div className={styles.page}>
                <div className={styles.header}>
                    <Logo className={styles.logo}/>
                    <div>
                        <Link href={"/registration"} className={styles.registration}>Регистрация</Link>
                        <Link href={"/login"} className={styles.login}>Вход</Link>
                    </div>
                </div>
                <div className={styles.indexPage}>
                    <h1>You are the brand.</h1>
                    <p>Никаких преград. Просто начни. Делись идеями, <br/> развивайся и находи единомышленников.</p>
                    <Link href={"/registration"}>
                        Start now
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 8.5L9 1.5M9 1.5H1M9 1.5V8.5" stroke="white" stroke-width="1.3" stroke-linecap="round"/>
                        </svg>
                    </Link>
                    <p className={styles.version}>Minimum Viable Product | Alpha Version</p>
                </div>
            </div>
        </>
    );
}

export default Index;