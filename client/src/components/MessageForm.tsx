import { IUser } from "@/types/user";
import { useState } from "react";
import { useRouter } from "next/router";
import { socket } from "@/config/socket";
import { verifyCorrectSymbols } from "@/utils/textValidation";
interface IMessageForm {
    user: IUser | null;
}

const MessageForm: React.FC<IMessageForm> = ({ user }) => {

    const router = useRouter();

    const [ message, setMessage ] = useState<string>('');
    const [ error, setError ] = useState<string | null>(null)
    const chatId = router.query.id;
    
    const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (user && user.id) {
            console.log(verifyCorrectSymbols({message: message}, setError))
            if (verifyCorrectSymbols({message: message}, setError)) {
                socket.emit('sendMessage', { author: user.id, chatId: chatId, text: message });
                setMessage('');
                setError(null);
            }
            else {
                return;
            }
        }
    }

    return (
        <>
            <form onSubmit={(event) => {sendMessage(event)}}>
                <textarea onChange={(event) => setMessage(event.target.value)} value={message}></textarea>
                <button disabled={!verifyCorrectSymbols({message: message})} type="submit">Ok</button>
            </form>
            {   error &&
                <p>{error}</p>
            }
        </>
    );
}

export default MessageForm;