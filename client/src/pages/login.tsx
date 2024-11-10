import AuthorizationInput from "@/components/AuthorizationInput";
import React, { useState, FormEvent, useMemo } from 'react';
import { ServerError, UserData } from '@/types/registration';
import { verifyCorrectSymbols } from "@/utils/textValidation";
import VerificationCodeInput from "@/components/VerificationCodeInput";
import axios from "axios";
import HCaptchaComponent from "@/components/HCaptchaComponent";
import { handleVerifyCaptcha } from "@/utils/captcha";

const LoginPage: React.FC = () => {
    const [formValues, setFormValues] = useState<UserData>({
        email: '',
        password: ''
    });

    const [serverError, setServerError] = useState<ServerError | null | string>(null);
    const [emailAlert, setEmailAlert] = useState<string | null>(null);
    const [showCaptcha, setShowCaptcha] = useState<boolean>(false);
    const [captchaAction, setCaptchaAction] = useState<'login' | 'forgotPassword' | null>(null); 

    const memoizedEmail = useMemo(() => formValues.email, [formValues.email]);

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

    return (
        <form method="post" onSubmit={handlePostUserData}>
            <AuthorizationInput name='email' placeholder='Почта' type='text' value={formValues.email} serverError={serverError} autoComplete='email' setFormValues={setFormValues} />
            <AuthorizationInput name='password' placeholder='Пароль' type='password' minLength={6} maxLength={32} value={formValues.password} autoComplete='current-password' serverError={serverError} setFormValues={setFormValues} />
            <button type="button" onClick={triggerForgotPassword}>Забыли пароль?</button>
            <button type="submit">Отправить</button>       
            {emailAlert && (
                <>
                    <p>{emailAlert}</p>
                    {emailAlert === 'Введите код, который пришёл на ваш электронный почтовый ящик' && <VerificationCodeInput email={memoizedEmail} />}
                </>
            )}
            {showCaptcha && (
                <HCaptchaComponent onVerify={onCaptchaVerified} />
            )}
        </form>
    );
}

export default LoginPage;
