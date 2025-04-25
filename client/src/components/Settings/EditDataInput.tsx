import { useAuthStore } from "@/utils/store";
import AuthorizationInput from "../AuthorizationInput";
import { ServerError } from "@/types/registration";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { UserData } from "@/types/registration";
import axios from "axios";
import { getToken, saveToken } from "@/utils/cookies";
import { socket } from "@/config/socket";

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

    useEffect(() => {
        const isEmailVerified = async () => {
            try {
                if (user) {
                    const response = await axios.post(`${process.env.API_URI}/edit-user-data`, {userId: user?.id}, { 
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
            console.log(data)
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
    
    return (
        <>
            {   user &&
                <div>
                    <form>
                        <AuthorizationInput name={name} placeholder={inputPlaceholder} type={type} value={value} autoComplete={autoComplete} setFormValues={setFormValues} serverError={serverError}/>
                        {   name === "email" && !isVerified &&
                            <button type="button">Verify</button>
                        }
                        {   value !== '' &&
                            <button type="button" onClick={handleEditUserData}>Ok</button>
                        }
                    </form>
                </div>
            }
        </>
    );
}

export default EditDataInput;