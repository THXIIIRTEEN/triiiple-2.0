import UserAvatar from "@/components/UserAvatar";
import { IMessage, IUser } from "@/types/user";
import { useAuthStore, useChatStore } from "@/utils/store";
import axios from "axios";
import { useEffect, useState } from "react";
import styles from '../styles/messanger.module.scss'
import { formateDate } from "@/utils/date";
import Username from "@/components/Username";
import { useRouter } from "next/router";
import { useSocketEvent } from "@/utils/useSocketEvent";

interface IMessangerPreviewProps {
    chatId: string,
    key: string,
    currentMode?: string,
}

const MessangerPreview: React.FC<IMessangerPreviewProps> = ({chatId, key, currentMode}) => {

    interface IExportData {
        friendData: IUser,
        notReadedMessages: number,
        lastMessage: IMessage
    }

    const [ chatData, setChatData ] = useState<IExportData | null>(null);
    const user = useAuthStore(state => state.user); 
    const [dateString, setDateString] = useState<string | null>(chatData && chatData.lastMessage && formateDate(chatData!.lastMessage.date) || null);

    const { addChatId } = useChatStore();  

    useEffect(() => {
        if (chatId) {
            addChatId([chatId]);
        }
    }, [chatId, addChatId]);

    useEffect(() => {
        if (chatData && chatData.lastMessage) {
            const dateToString = formateDate(chatData!.lastMessage.date);
            setDateString(dateToString);
        }
    }, [chatData]);

    useEffect(() => {
        const fetchChatData = async () => {
            if (user) {
                const response = await axios.post(`${process.env.API_URI}/get-chat-data`, {chatId, userId: user.id});
                setChatData(response.data.chatData)
            }
        }
        fetchChatData();
    }, [chatId, user]);

    useSocketEvent('addNotReadedMessage', (msg) => { 
        if (user && chatId === msg.chatId) {
            setChatData((prevData) => ({
            ...prevData!, 
            notReadedMessages: msg.author._id !== user.id ? prevData!.notReadedMessages + 1 : prevData!.notReadedMessages,
            lastMessage: msg
        }));
        }
    });
    
    const router = useRouter();

    const handleRedirect = () => {
        router.push(`${currentMode === "sidebarMessanger" ? `${chatId}` : `messanger/${chatId}`}`);
    }
    return (
        <div className={`${styles.block} ${currentMode === "sidebarMessanger" && styles.sidebarMessanger}`} key={key} onClick={() => handleRedirect()}>
            { chatData && 
                <UserAvatar id={chatData.friendData._id} className={styles.avatar}/>
            }
            <div className={styles.textBlock}>
                <div className={styles.top}>
                    { chatData && chatData.friendData.tag &&
                        <Username className={styles.username} username={chatData.friendData.username} tag={chatData.friendData.tag}/>
                    }
                    { chatData && dateString &&
                        <span className={styles.date}>{dateString}</span>
                    }
                    { chatData && chatData.notReadedMessages > 0 &&
                        <span className={styles.notReaded}>{chatData.notReadedMessages}</span>
                    }
                </div>
                <div className={styles.bottom}>
                    {   chatData && chatData.lastMessage && chatData.lastMessage.text.trim() &&
                        chatData.friendData._id !== chatData.lastMessage.author._id && 
                            <p>{chatData.lastMessage.text}</p>
                    } 
                    {   chatData && chatData.lastMessage && chatData.lastMessage.text.trim() &&
                        chatData.friendData._id === chatData.lastMessage.author._id && 
                            <p>{`Вы: ${chatData?.lastMessage.text}`}</p>
                    } 
                    {   chatData && !chatData.lastMessage &&
                            <p>Здесь пока ничего нет...</p>
                    }               
                    {   chatData && chatData.lastMessage && !chatData.lastMessage.text && chatData.lastMessage.files && chatData.lastMessage.files.length > 0 &&
                            <p>Файл</p>
                    }
                </div>
            </div>
            
        </div>
    );
}

export default MessangerPreview;