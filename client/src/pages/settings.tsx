import AvatarInput from "@/components/AvatarInput";
import EditDataInput from "@/components/Settings/EditDataInput";
import { useAuthStore } from "@/utils/store";
import { useState } from "react";
import { UserData } from "@/types/registration";
import UserAvatar from "@/components/UserAvatar";
import MessageForm from "@/components/Messanger/MessageForm/MessageForm";
import { removeToken } from "@/utils/cookies";
import Protected from "@/components/Protected";
import Header from "@/components/Header/Header";
import styles from "./styles/settings.module.scss"
import Sidebar from "@/components/Sidebar/Sidebar";
import Head from "next/head";

const SettingsPage: React.FC = () => {

    const [formValues, setFormValues] = useState<UserData>({
        username: '',
        tag: '',
        email: '',
        password: ''
    });
    const [ showInput, setShowInput ] = useState<boolean>(false);
    const user = useAuthStore(state => state.user); 
    const logout = useAuthStore().logout;
    const handleLogout = () => {
        logout();
        removeToken();
        window.location.reload();
    }

    return (
        <>
            <Head>
                <title>Настройки</title>
                <meta name="description" content="Настйроки triiiple"/>
            </Head>
            <Protected>
                <Header/>
                    <div className={styles.page}>
                        <Sidebar currentPage="settings"/>
                        {   user &&
                            <div className={styles.settingsPage}>
                                <div className={styles.profileBlock}>
                                    {   user && showInput &&
                                    <AvatarInput user={user} className={styles.avatarInput} onMouseLeave={() => setShowInput(false)}/>
                                    }
                                    <UserAvatar onMouseEnter={() => setShowInput(true)} id={user?.id} className={styles.profile}/> 
                                </div>
                                
                                <div className={styles.contentBlock}>
                                    <div className={`${styles.formBlock}`}>
                                        <h2>Имя пользователя</h2>
                                        <EditDataInput name='username' placeholder={`${user.username}`} type='text' minLength={4} maxLength={16} value={formValues.username || ''} autoComplete='new-password' setFormValues={setFormValues} />
                                    </div>
                                    <div className={`${styles.formBlock}`}>
                                        <h2>Тэг</h2>
                                        <EditDataInput name='tag' placeholder={`${user.tag}`} type='text' minLength={4} maxLength={16} value={formValues.tag || ''} autoComplete='new-password' setFormValues={setFormValues} />
                                    </div>
                                    <div className={`${styles.formBlock}`}>
                                        <h2>Электронная почта</h2>
                                        <EditDataInput name='email' placeholder={`${user.email}`} type='email' value={formValues.email} autoComplete='email' setFormValues={setFormValues}/>
                                    </div>
                                    <div className={`${styles.formBlock} ${styles.password}`}>
                                        <h2>Пароль</h2>
                                        <EditDataInput name='password' placeholder='******' type='password' minLength={6} maxLength={32} value={formValues.password} autoComplete='new-password' setFormValues={setFormValues}/>
                                    </div>
                                    <div className={`${styles.formBlock}`}>
                                        <h2>Обо Мне</h2>
                                        <MessageForm className={styles.settingsAboutMe} type="send" page={'AboutUser'} user={user}/>
                                    </div>
                                    <button className={styles.leaveButton} onClick={handleLogout}>
                                        <svg width="800" height="800" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M400 500L500 400M500 400L400 300M500 400H133.333M133.333 241.601V240.007C133.333 202.67 133.333 183.987 140.6 169.727C146.991 157.182 157.183 146.991 169.727 140.6C183.988 133.333 202.67 133.333 240.007 133.333H560.007C597.343 133.333 615.987 133.333 630.247 140.6C642.79 146.991 653.017 157.182 659.407 169.727C666.667 183.973 666.667 202.633 666.667 239.897V560.12C666.667 597.383 666.667 616.017 659.407 630.263C653.017 642.807 642.79 653.017 630.247 659.407C616 666.667 597.367 666.667 560.103 666.667H239.897C202.633 666.667 183.974 666.667 169.727 659.407C157.183 653.017 146.991 642.797 140.6 630.253C133.333 615.993 133.333 597.337 133.333 560V558.333" stroke="white" stroke-width="66.6667" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                        Выйти из аккаунта
                                    </button>
                                </div>
                            </div>
                        }
                    </div>
                
            </Protected>
        </>
    )
}

export default SettingsPage;