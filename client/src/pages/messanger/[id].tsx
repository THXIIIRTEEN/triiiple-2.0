import MessageForm from "@/components/Messanger/MessageForm/MessageForm";
import Protected from "@/components/Protected";
import { IMessage } from "@/types/user";
import { getToken, getUserFromCookies } from "@/utils/cookies";
import { useAuthStore } from "@/utils/store";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Message from "@/components/Messanger/Message";
import { socket } from "@/config/socket";

const Messanger: React.FC = () => {

    const router = useRouter();

    const user = useAuthStore(state => state.user);
    const [ profile, setProfile ] = useState(user);  
    const [ messageArray, setMessageArray ] = useState<IMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const token = getToken();
    const chatId = router.query.id;

    const limit = 2;

    useEffect(() => {
        window.scrollTo({ top: document.body.scrollHeight });
    }, [messageArray]); 
      
    const handleGetMessages = useCallback(async (limit: number, skip?: number, ) => {
        if (chatId) {
            const response = await axios.post(`${process.env.API_URI}/get-messages`, {chatId, limit, skip}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            response.data.chat.messages.reverse()
            return response;
        }
    }, [chatId, token]);

    const handleGetMoreMessages = useCallback(async (skip: number, limit: number) => {
        setLoading(true)
        const response = await handleGetMessages(skip, limit);
        if (response && response.data.chat?.messages.length > 0) {
            setMessageArray((messages) => [...response.data.chat?.messages, ...messages]);
        }
        setLoading(false)
    }, [handleGetMessages])

    const firstMessageRef = useRef<HTMLButtonElement | null>(null); 

    useEffect(() => {

        const messageRef = firstMessageRef.current
        
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading) {
                    handleGetMoreMessages(limit, messageArray.length)
                }
            },
            { root: null, rootMargin: "0px", threshold: 0.1 }
        );
    
        if (messageRef) observer.observe(messageRef);
    
        return () => {
            if (messageRef) observer.unobserve(messageRef);
        };
    }, [messageArray, loading, handleGetMoreMessages]);

    useEffect(() => {
        if (!user) {
            setProfile(getUserFromCookies())
        }
    }, [user, profile]);

    useEffect(() => {
        if (profile && profile.id) {
            const importMessageFromResponse = async () => {
                const response = await handleGetMessages(limit);
                if (response) {
                    setMessageArray(response.data.chat?.messages);
                }
            }
            importMessageFromResponse();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile, token, chatId, handleGetMessages])

    useEffect(() => {
        if (chatId) {
            socket.connect();
            socket.emit('joinRoom', chatId);
    
            socket.on('sendMessageResponse', (msg: IMessage) => {
                setMessageArray((prevMessages) => [...prevMessages, msg]);
            });
    
            return () => {
                socket.off('sendMessageResponse');
                socket.disconnect();
            };
        }
    }, [chatId]);

    interface IMsgDelete {
        messageId: string,
        chatId: string
    }

    useEffect(() => {
        if (chatId) {
            socket.on('deleteMessageResponse', (msg: IMsgDelete) => {
                setMessageArray((prevMessages) => 
                    prevMessages.filter((message) => 
                        message._id !== msg.messageId
                    )
                );
            });
    
            return () => {
                socket.off('deleteMessageResponse');
            };
        }
    }, [chatId]);
    interface IMsgEdit {
        messageId: string,
        text: string,
        isEdited: true
    }

    useEffect(() => {
        if (chatId) {
            socket.on('editMessageResponse', (msg: IMsgEdit) => {
                setMessageArray((prevMessages) => 
                    prevMessages.map((message) => 
                        message._id === msg.messageId ? { ...message, text: msg.text, isEdited: msg.isEdited } : message
                    )
                );
            });
    
            return () => {
                socket.off('editMessageResponse');
            };
        }
    }, [chatId]);

    useEffect(() => {
        if (chatId) {
            socket.on('sendMessageWithFilesResponse', (msg: IMessage) => {
                setMessageArray((prevMessages) => [...prevMessages, msg]);
            });
    
            return () => {
                socket.off('sendMessageWithFilesResponse');
                socket.disconnect();
            };
        }
    }, [chatId]);

    return (
        <Protected>
            <button onClick={() => handleGetMoreMessages(limit, messageArray.length)} ref={firstMessageRef}>
                Подгрузить ещё сообщения
            </button>
            {   messageArray &&
                messageArray.map((message: IMessage) => (
                    <Message key={message._id} {...message} />
                ))
            }
            {   profile &&
                <MessageForm type="send" user={profile}/>
            }
        </Protected>
    );
}

export default Messanger;