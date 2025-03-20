"use client"

import MessageForm from "@/components/Messanger/MessageForm/MessageForm";
import Protected from "@/components/Protected";
import { IMessage } from "@/types/user";
import { getToken, getUserFromCookies } from "@/utils/cookies";
import { useAuthStore } from "@/utils/store";
import axios from "axios";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Message from "@/components/Messanger/Message";
import { socket } from "@/config/socket";
import styles from './messanger.module.css'
import UserOnlineStatus from "@/components/Messanger/UserOnlineStatus/UserOnlineStatus";

const Messanger: React.FC = () => {
    const router = useRouter();
    const user = useAuthStore(state => state.user);
    const [profile, setProfile] = useState(user);
    const [messageArray, setMessageArray] = useState<IMessage[]>([]);
    const [scrolled, setScrolled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [ chatMembers, setChatMembers ] = useState<string[]>([]);
    const [ friendId, setFriendId ] = useState<string | null>(null);
    const token = getToken();
    const chatId = router.query.id;
    const limit = 5;

    const firstMessageRef = useRef<HTMLDivElement | null>(null);
    const chatBottomRef = useRef<HTMLDivElement | null>(null);
    const chatWrapperRef = useRef<HTMLDivElement | null>(null);
    const lastMessageRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (chatBottomRef.current && messageArray.length > 0 && !scrolled) {
            setTimeout(() => {
                chatBottomRef.current?.scrollIntoView({ behavior: "instant" });
                setScrolled(true)
            }, 0);
        }
      }, [messageArray, scrolled]);

    const handleGetMessages = useCallback(async (limit: number, skip = 0) => {
        if (!chatId) return;
        const response = await axios.post(`${process.env.API_URI}/get-messages`, { chatId, limit, skip }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.chat?.messages.reverse();
    }, [chatId, token]);

    const handleGetMoreMessages = useCallback(async () => {
        if (loading || !chatId) return;
        setLoading(true);
        const messages = await handleGetMessages(limit, messageArray.length);
        if (messages?.length) {
            setMessageArray(prev => [...messages, ...prev]);
        }
        setLoading(false);
    }, [loading, chatId, messageArray.length, handleGetMessages]);

    useEffect(() => {
        const getChatMembers = async () => {
            if (chatId) {
                const response = await axios.post(`${process.env.API_URI}/get-chat-members`, {chatId});
                setChatMembers(response.data.chat.members)
            }
        }
        getChatMembers();
    }, [chatId]);

    useEffect(() => {
        const getFriendId = async () => {
            if (user && chatMembers && chatMembers.length === 2) {
                const friend = chatMembers.filter((id) => id !== user.id);
                setFriendId(friend[0])
            }
        }
        getFriendId();
    })

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && scrolled) {
                handleGetMoreMessages();
                lastMessageRef.current?.scrollIntoView({ behavior: 'instant' })
            }
        }, { rootMargin: "0px", threshold: 0.1 });

        if (firstMessageRef.current) observer.observe(firstMessageRef.current);

        return () => observer.disconnect();
    }, [handleGetMoreMessages, scrolled]);

    useEffect(() => {
        if (!profile) setProfile(getUserFromCookies());
    }, [user, profile]);

    useEffect(() => {
        const fetchMessages = async () => {
            const messages = await handleGetMessages(limit);
            if (messages) setMessageArray(messages);
        };

        if (profile?.id) fetchMessages();
    }, [profile, handleGetMessages]);

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

    useEffect(() => {
        if (chatId) {
            socket.on('readMessageResponse', ({ messageId, isRead } : { messageId: string, isRead: boolean }) => {
                setMessageArray(prev => prev.map(m => (m._id === messageId ? { ...m, isRead } : m)));
            });
    
            return () => {
                socket.off('readMessageResponse');
                socket.disconnect();
            };
        }
    }, [chatId]);

    return (
        <Protected>
            <div className={styles['message-wrapper']} ref={chatWrapperRef}>
                <div ref={firstMessageRef}></div>
                {messageArray.map((message, index) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { ref: _ignored, ...messageProps } = message;
                return (
                    <Message
                        key={message._id}
                        ref={index === 0 ? lastMessageRef : null}
                        {...messageProps}
                    />
                );
                })}                
                {   user && user.id && friendId &&
                    <UserOnlineStatus friendId={friendId} userId={user.id}/>
                }
                {profile && <MessageForm type="send" user={profile}/>}
                <div ref={chatBottomRef}></div>
            </div>
        </Protected>
    );
};

export default Messanger;
