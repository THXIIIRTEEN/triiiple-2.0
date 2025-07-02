import { useAuthStore } from "@/utils/store";
import AuthorizationInput from "../AuthorizationInput";
import { ServerError } from "@/types/registration";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { UserData } from "@/types/registration";
import axios from "axios";
import { getToken, saveToken } from "@/utils/cookies";
import { socket } from "@/config/socket";
import VerificationCodeInput from "../VerificationCodeInput";
import styles from "./editDataInput.module.scss"

interface IEditDataInputProps {
    name: string;
    placeholder: string;
    type: string;
    minLength?: number;
    maxLength?: number;
    value: string;
    autoComplete: string;
    serverError?: ServerError | null | string;
    setFormValues: Dispatch<SetStateAction<UserData>>
}

const EditDataInput: React.FC<IEditDataInputProps> = ({name, placeholder, type, value, autoComplete, setFormValues}) => {
    const user = useAuthStore(state => state.user); 
    const token = getToken(); 
    const updateUserField = useAuthStore(state => state.updateUserField);

    const [ inputPlaceholder, setInputPlaceholder ] = useState<string>(placeholder);
    const [ serverError, setServerError ] = useState<ServerError | null | string>(null);
    const [ isVerified, setIsVerified ] = useState<boolean>(true);
    const [ showVerificationInput, setShowVerificationInput ] = useState<boolean>(false);
    const [ isPasswordEdit, setIsPasswordEdit ] = useState<boolean>(false);
    const [ arePasswordSame, setArePasswordSame ] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    

    const [passwordValues, setPasswordValues] = useState({
        newPassword: '',
        secondNewPassword: '',
    });

    useEffect(() => {
        const isEmailVerified = async () => {
            try {
                if (user) {
                    const response = await axios.post(`${process.env.API_URI}/check-verified-email`, {userId: user?.id}, { 
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (response.status == 200) {
                        setIsVerified(response.data.verified);
                    }
                }
            }
            catch (error) {
                console.log(error)
                if (axios.isAxiosError(error) && error.response) {
                    setServerError(error.response.data);
                }
            }
        }
        if (name === "email") {
            isEmailVerified();
        }
    }, [name, token, user]);

    useEffect(() => {
        socket.on('changeEmailResponse', (data) => {
            setServerError(null);
            const token = data.token; 
            saveToken(token);
            updateUserField('email', data.userNew.email)
            if (name === 'email') {
                setInputPlaceholder(data.userNew.email);
            }
            setFormValues(prevValues => ({
                ...prevValues,
                email: ''
            }));
        });
    
        return () => {
            socket.emit("leaveRoom", `edit-email-${user?.id}`)
            socket.off('changeEmailResponse');
        };
      }, [setFormValues, updateUserField, user, name]);

      useEffect(() => {
        socket.on('changePasswordResponse', (data) => {
            setServerError(null);
            const token = data.token; 
            saveToken(token);
            updateUserField('password', data.userNew.password)
            if (name === 'password') {
                setArePasswordSame(true);
                setIsPasswordEdit(false);
            }
            setFormValues(prevValues => ({
                ...prevValues,
                password: ''
            }));
            setPasswordValues({
                newPassword: '',
                secondNewPassword: ''
            });
        });
    
        return () => {
            socket.emit("leaveRoom", `edit-password-${user?.id}`)
            socket.off('changePasswordResponse');
        };
      }, [setFormValues, updateUserField, user, name]);

    const handleEditUserData = async () => {
        const formData = {
            userId: user?.id,
            name: name,
            value
        }
        try {
            if (name === 'email') {
                socket.connect();
                socket.emit('joinRoom', `edit-email-${user?.id}`);
            }
            if (name === 'password') {
                socket.connect();
                socket.emit('joinRoom', `edit-password-${user?.id}`);
                //@ts-expect-error xuy
                formData.newPassword = passwordValues.newPassword;
            }
            const response = await axios.post(`${process.env.API_URI}/edit-user-data`, formData, { 
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.status == 200) {
                setServerError(null);
                const token = response.data.token; 
                saveToken(token);
                updateUserField(formData.name, response.data.user[formData.name])
                setInputPlaceholder(response.data.user[formData.name]);
                setFormValues(prevValues => ({
                    ...prevValues,
                    [formData.name]: ''
                }));
            }
        }
        catch (error) {
            console.log(error)
            if (axios.isAxiosError(error) && error.response) {
                setServerError(error.response.data);
            }
        }
    }

    const handleVerifyEmail = async () => {
        try {
            if (user) {
                const response = await axios.post(`${process.env.API_URI}/verify-email`, {userId: user?.id}, { 
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.status == 200) {
                    setShowVerificationInput(!showVerificationInput);
                }
            }
        }
        catch (error) {
            console.log(error)
            if (axios.isAxiosError(error) && error.response) {
                setServerError(error.response.data);
            }
        }
    }

    const handleShowPasswordInputs = () => {
        setIsPasswordEdit(true)
    }

    useEffect(() => {
        if (passwordValues.newPassword === passwordValues.secondNewPassword) {
            setArePasswordSame(true)
        }
        else {
            setArePasswordSame(false)
        }
    }, [passwordValues])
    
    return (
        <>
            {   user &&
                <div>
                    <form className={styles.form}>
                        <AuthorizationInput setInputError={setError} name={name} onFocus={name === "password" ? handleShowPasswordInputs : undefined} placeholder={isPasswordEdit && name === "password" ? "Введите старый пароль" : inputPlaceholder} type={type} value={value} autoComplete={autoComplete} setFormValues={setFormValues} serverError={serverError}/>
                        {   name === "password" && isPasswordEdit &&
                            <>
                            {/* @ts-expect-error xyi */}
                            <AuthorizationInput setError={setError} name={"newPassword"} placeholder={"Введите новый пароль"} type={type} value={passwordValues.newPassword} autoComplete={autoComplete} setFormValues={setPasswordValues} serverError={serverError}/>
                            {/* @ts-expect-error xyi */}
                            <AuthorizationInput setError={setError} name={"secondNewPassword"} placeholder={"Повторите новый пароль"} type={type} value={passwordValues.secondNewPassword} autoComplete={autoComplete} setFormValues={setPasswordValues} serverError={serverError}/>
                            </>
                        }
                        {   !arePasswordSame &&
                            <span className={"error"}>Пароли не совпадают</span>
                        }   
                        {   name === "email" && !isVerified && !error &&
                            <button className={styles.button} type="button" onClick={handleVerifyEmail}>Подтвердить</button>
                        }
                        {   value !== '' && name === "password" && arePasswordSame && !error &&
                            <button className={styles.button} type="button" onClick={handleEditUserData}>Отправить</button>
                        }
                        {   value !== '' && name !== "password" && !error &&
                            <button className={styles.button} type="button" onClick={handleEditUserData}>Отправить</button>
                        }
                        {   name === "email" && showVerificationInput && user.email &&
                            <>
                                <p>Код подтверждения пришёл на вашу почту</p>
                                <VerificationCodeInput email={user.email} setIsVerified={setIsVerified} setShowVerificationInput={setShowVerificationInput}/>
                            </>
                        }   
                    </form>
                </div>
            }
        </>
    );
}

export default EditDataInput;