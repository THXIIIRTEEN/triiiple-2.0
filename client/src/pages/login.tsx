import AuthorizationInput from "@/components/AuthorizationInput";
import React, { useState, FormEvent, useMemo, useRef, useEffect } from 'react';
import { ServerError, UserData } from '@/types/registration';
import { verifyCorrectSymbols } from "@/utils/textValidation";
import VerificationCodeInput from "@/components/VerificationCodeInput";
import axios from "axios";
import HCaptchaComponent from "@/components/HCaptchaComponent";
import { handleVerifyCaptcha } from "@/utils/captcha";
import HCaptcha from '@hcaptcha/react-hcaptcha';
import styles from "./styles/login.module.scss"
import OauthBlock from "@/components/OauthBlock/OauthBlock";
import Link from "next/link";
import Logo from "@/assets/Logo.svg"
import { getToken } from "@/utils/cookies";
import { useRouter } from "next/router";
import { useAuthStore } from "@/utils/store";

const LoginPage: React.FC = () => {
    const token = getToken(); 
    const router = useRouter(); 
    const user = useAuthStore().user; 

    const [formValues, setFormValues] = useState<UserData>({
        email: '',
        password: ''
    });

    const [serverError, setServerError] = useState<ServerError | null | string>(null);
    const [emailAlert, setEmailAlert] = useState<string | null>(null);
    const [showCaptcha, setShowCaptcha] = useState<boolean>(false);
    const [captchaAction, setCaptchaAction] = useState<'login' | 'forgotPassword' | null>(null); 

    const memoizedEmail = useMemo(() => formValues.email, [formValues.email]);

    const captchaRef = useRef<HCaptcha | null>(null);

    const handlePostUserData = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setCaptchaAction('login');
        setShowCaptcha(true);       
    };

    const triggerForgotPassword = () => {
        setCaptchaAction('forgotPassword');
        setShowCaptcha(true);
    };

    const onCaptchaVerified = async (token: string) => {
        const isCaptchaVerified = await handleVerifyCaptcha(token, setServerError);

        if (isCaptchaVerified) {
            if (captchaAction === 'login') {
                await handleLogin();
            } else if (captchaAction === 'forgotPassword') {
                await handleForgotPassword();
            }
        }
    };

    const handleLogin = async () => {
        if (verifyCorrectSymbols(formValues)) {
            try {
                const response = await axios.post(`${process.env.API_URI!}/users/login`, formValues);
                if (response.status === 200) {
                    setEmailAlert('Введите код, который пришёл на ваш электронный почтовый ящик');
                }
            } catch (error) {
                if (axios.isAxiosError(error) && error.response) {
                    setServerError(error.response.data);
                    if (captchaRef && captchaRef.current) {
                        //@ts-expect-error nah
                        captchaRef.current._hcaptcha.reset();
                    }
                }
            }
        }
    };

    const handleForgotPassword = async () => {
        const email = formValues.email;

        if (verifyCorrectSymbols({email: email})) {
            try {
                const response = await axios.post(`${process.env.API_URI!}/reset/password`, {email});
                if (response.status === 200) {
                    setEmailAlert('Инструкции по восстановлению пароля пришли на вашу электронную почту')
                }
            } catch (error) {
                if (axios.isAxiosError(error) && error.response) {
                    setServerError(error.response.data);
                }
            }
        }
    }

    useEffect(() => { 
        if (token && user) {
            router.push(`/profile/${user.tag}`);
        }
    }, [token, router, user]);

    return (
        <div className={styles.background}>
            <Logo className={styles.logo}/>
            <form className={styles.form} method="post" onSubmit={handlePostUserData}>
                <h2 className={styles.title}>Вход</h2>

                <div className={styles.inputs}>
                    <div className={styles.section}>
                        <p className={styles.subTitle}>Электронная почта</p>
                        <AuthorizationInput name='email' placeholder='Адрес электронной почты' type='email' value={formValues.email} serverError={serverError} autoComplete='email' setFormValues={setFormValues} />
                    </div>
                    <div className={styles.section}>
                        <p className={styles.subTitle}>Пароль</p>
                        <AuthorizationInput name='password' placeholder='**********' type='password' minLength={6} maxLength={32} value={formValues.password} autoComplete='current-password' serverError={serverError} setFormValues={setFormValues} /> 
                    </div>
                </div>
                <button className={`${styles.link} ${styles.forgotPassword}`} type="button" onClick={triggerForgotPassword}>Забыли пароль?</button> 
                <div className={styles.buttonBlock}>
                    {showCaptcha && (
                        <div className={styles.captchaBlock}>
                            <HCaptchaComponent ref={captchaRef} onVerify={onCaptchaVerified} />
                        </div>
                    )}
                    {!showCaptcha && (
                        <>
                            <button className={styles.button} disabled={!verifyCorrectSymbols(formValues)} type="submit">
                                {(!verifyCorrectSymbols(formValues)) && (
                                    <svg className={styles.svg} viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6 8.02778V9.25M2.875 5.29538C3.16964 5.27778 3.53287 5.27778 4 5.27778H8C8.46712 5.27778 8.83038 5.27778 9.125 5.29538M2.875 5.29538C2.5073 5.31732 2.24643 5.36669 2.02377 5.47761C1.67096 5.65337 1.38413 5.93381 1.20436 6.27878C1 6.67099 1 7.18432 1 8.21111V9.06667C1 10.0935 1 10.6068 1.20436 10.999C1.38413 11.344 1.67096 11.6244 2.02377 11.8002C2.42485 12 2.9499 12 4 12H8C9.05012 12 9.57512 12 9.97625 11.8002C10.3291 11.6244 10.6159 11.344 10.7956 10.999C11 10.6068 11 10.0935 11 9.06667V8.21111C11 7.18432 11 6.67099 10.7956 6.27878C10.6159 5.93381 10.3291 5.65337 9.97625 5.47761C9.75356 5.36669 9.49269 5.31732 9.125 5.29538M2.875 5.29538V4.05556C2.875 2.36802 4.27411 1 6 1C7.72587 1 9.125 2.36802 9.125 4.05556V5.29538" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                )}
                                Продолжить
                            </button>   
                            <Link className={styles.link} href={'/registration'}>У вас нет учетной записи?</Link>
                        </>   
                    )}
                    {emailAlert && (
                        <div className={styles.overlay}>
                            <div className={styles.emailAlert}>
                                <button className={styles.closeButton} onClick={() => setEmailAlert(null)}>
                                    <svg className={styles.closeIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16 8L8 16M8.00001 8L16 16" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></g></svg>
                                </button>
                                <p className={styles.titleAlert}>Верификация</p>
                                <p className={styles.textAlert}>{emailAlert}</p>
                                {emailAlert === 'Введите код, который пришёл на ваш электронный почтовый ящик' && <VerificationCodeInput email={memoizedEmail} />}
                            </div>
                        </div>
                    )}
                </div>
            </form>
            <svg className={styles.separator} width="24" height="438" viewBox="0 0 24 438" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.76474 220.27L5.44371 214.364H6.79599V222H5.62269V216.094L1.9636 222H0.591442V214.364H1.76474V220.27ZM8.26882 222V220.906H8.54723C8.77592 220.906 8.9665 220.862 9.11896 220.772C9.27143 220.679 9.39406 220.518 9.48686 220.29C9.58298 220.058 9.65589 219.736 9.70561 219.325C9.75864 218.911 9.79676 218.384 9.81996 217.744L9.95916 214.364H15.0501V222H13.8768V215.457H11.0728L10.9535 218.182C10.927 218.808 10.8706 219.36 10.7844 219.837C10.7016 220.311 10.574 220.709 10.4016 221.031C10.2326 221.352 10.0072 221.594 9.7255 221.756C9.44377 221.919 9.09079 222 8.66655 222H8.26882ZM18.3761 220.27L22.055 214.364H23.4073V222H22.234V216.094L18.5749 222H17.2028V214.364H18.3761V220.27Z" fill="black"/>
                <line x1="12.5" y1="-2.18557e-08" x2="12.5" y2="202" stroke="black"/>
                <line x1="12.5" y1="236" x2="12.5" y2="438" stroke="black"/>
            </svg>
            <OauthBlock/>
        </div>
    );
}

export default LoginPage;
