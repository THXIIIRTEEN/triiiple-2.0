import { IUser } from "@/types/user";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { getToken } from "@/utils/cookies";

interface IMessageForm {
    user: IUser | null;
}

const MessageForm: React.FC<IMessageForm> = ({ user }) => {

    const router = useRouter();

    const [ message, setMessage ] = useState<string | null>(null);
    const chatId = router.query.id;
    const token = getToken(); 
    
    const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (user && user.id) {
            await axios.post(`${process.env.API_URI}/create-message`, 
                {
                    author: user.id, 
                    chatId: chatId, 
                    text: message
                }, 
                {headers: {
                    'Authorization': `Bearer ${token}`,
            }});
        }
    }

    return (
        <>
            <form onSubmit={(event) => {sendMessage(event)}}>
                <textarea onChange={(event) => setMessage(event.target.value)}></textarea>
                <button type="submit">Ok</button>
            </form>
        </>
    );
}

export default MessageForm;