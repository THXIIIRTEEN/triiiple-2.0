import UserAvatar from "@/components/UserAvatar";
import { socket } from "@/config/socket";
import { IMessage, IUser } from "@/types/user";
import { useAuthStore } from "@/utils/store";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

interface IMessangerPreviewProps {
    chatId: string,
    key: string
}

const MessangerPreview: React.FC<IMessangerPreviewProps> = ({chatId, key}) => {

    interface IExportData {
        friendData: IUser,
        notReadedMessages: number,
        lastMessage: IMessage
    }

    const [ chatData, setChatData ] = useState<IExportData | null>(null);
    const user = useAuthStore(state => state.user); 
    
    useEffect(() => {
        const fetchChatData = async () => {
            if (user) {
                const response = await axios.post(`${process.env.API_URI}/get-chat-data`, {chatId, userId: user.id});
                console.log(response)
                setChatData(response.data.chatData)
            }
        }
        fetchChatData();
    }, [chatId, user]);
    
    useEffect(() => {
        if (chatId) {
            socket.connect();
            socket.emit('joinRoom', chatId);
    
            socket.on('addNotReadedMessage', (msg) => {
                console.log(msg)
                setChatData((prevData) => ({
                    ...prevData!, 
                    notReadedMessages: prevData!.notReadedMessages + 1,
                    lastMessage: msg
                }));
            });
    
            return () => {
                socket.off('addNotReadedMessage'); 
            };
        }
    }, [chatId]);

    return (
        <div>
            { chatData && 
                <p>{chatData.friendData.username}</p>
            }
            { chatData && 
                <UserAvatar id={chatData.friendData._id}/>
            }
            <Link key={key} href={`messanger/${chatId}`}>{chatId}</Link>
            { chatData && 
                <p>{chatData.notReadedMessages}</p>
            }
            { chatData && chatData.lastMessage.text &&
                <p>{chatData.lastMessage.text}</p>
            }
            {   chatData && !chatData.lastMessage.text && chatData.lastMessage.files && chatData.lastMessage.files.length > 0 &&
                <p>Файл</p>
            }
        </div>
    );
}

export default MessangerPreview;