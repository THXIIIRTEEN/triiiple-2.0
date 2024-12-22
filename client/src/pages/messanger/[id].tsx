import MessageForm from "@/components/MessageForm";
import Protected from "@/components/Protected";
import { IMessage } from "@/types/user";
import { getToken, getUserFromCookies } from "@/utils/cookies";
import { useAuthStore } from "@/utils/store";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Message from "@/components/Message";
import { socket } from "@/config/socket";

const Messanger: React.FC = () => {

    const router = useRouter();

    const user = useAuthStore(state => state.user);
    const [ profile, setProfile ] = useState(user);  
    const [ messageArray, setMessageArray ] = useState<IMessage[]>([])
    const token = getToken();
    const chatId = router.query.id;
    
    useEffect(() => {
        if (!user) {
            setProfile(getUserFromCookies())
        }
    }, [user, profile]);

    useEffect(() => {
        if (profile && profile.id) {
            const handleGetMessages = async () => {
                const response = await axios.post(`${process.env.API_URI}/get-messages`, {chatId: chatId}, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                setMessageArray(response.data.chat?.messages);
            };
            handleGetMessages();
        }
    }, [profile, token, chatId])

    useEffect(() => {
        if (chatId) {
            socket.connect();
            socket.emit('joinRoom', chatId);
    
            socket.on('chatMessage', (msg: IMessage) => {
                setMessageArray((prevMessages) => [...prevMessages, msg]);
            });
    
            return () => {
                socket.off('chatMessage');
                socket.disconnect();
            };
        }
    }, [chatId]);

    return (
        <Protected>
            {   messageArray &&
                messageArray.map((message: IMessage) => (
                    <Message key={message._id} {...message} />
                ))
            }
            <MessageForm user={profile}/>
        </Protected>
    );
}

export default Messanger;