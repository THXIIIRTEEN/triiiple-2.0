import { ServerError } from "@/types/registration";
import axios from "axios";

export const handleVerifyCaptcha = async (token: string | null, setServerError: React.Dispatch<React.SetStateAction<ServerError | null | string>> ) => {
    if (!token) return false;
    try {
        const response = await axios.post(`${process.env.API_URI!}/captcha`, { token }); 
        if (response.status === 200 && response.data.success) {
            return true;
        }
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            setServerError(error.response.data.message);
            return false;
        } 
    }
};

