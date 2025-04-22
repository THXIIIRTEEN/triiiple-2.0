import { useAuthStore } from "@/utils/store";
import AuthorizationInput from "../AuthorizationInput";
import { ServerError } from "@/types/registration";
import { Dispatch, SetStateAction, useState } from "react";
import { UserData } from "@/types/registration";
import axios from "axios";
import { getToken, saveToken } from "@/utils/cookies";

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
    const [serverError, setServerError] = useState<ServerError | null | string>(null);

    const handleEditUserData = async () => {
        const formData = {
            userId: user?.id,
            name: name,
            value
        }
        try {
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