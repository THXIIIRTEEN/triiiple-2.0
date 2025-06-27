"use client"

import MessageForm from "@/components/Messanger/MessageForm/MessageForm";
import Protected from "@/components/Protected";
import { IMessage, IUser } from "@/types/user";
import { getToken, getUserFromCookies } from "@/utils/cookies";
import { useAuthStore } from "@/utils/store";
import axios from "axios";
import { useEffect, useRef, useState, RefObject } from "react";
import { useRouter } from "next/router";
import Message from "@/components/Messanger/Message";
import { socket } from "@/config/socket";
import styles from './messanger.module.scss'
import UserOnlineStatus from "@/components/Messanger/UserOnlineStatus/UserOnlineStatus";
import Sidebar from "@/components/Sidebar/Sidebar";
import UserAvatar from "@/components/UserAvatar";
import Username from "@/components/Username";
import Link from "next/link";

const Messanger: React.FC = () => {
    const router = useRouter();
    const user = useAuthStore(state => state.user);
    const [profile, setProfile] = useState(user);
    const [messageArray, setMessageArray] = useState<IMessage[]>([]);
    const [ chatMembers, setChatMembers ] = useState<string[]>([]);
    const [ friendId, setFriendId ] = useState<string | null>(null);
    const [ friendData, setFriendData ] = useState<IUser | null>(null);
    const [ messagesFetched, setMessagesFetched ] = useState<boolean>(false);
    const [ isScrolled, setIsScrolled ] = useState<boolean>(false);
    const [ isVisible, setIsVisible ] = useState<boolean>(false);
    const [ isSending, setIsSending ] = useState<boolean>(false);
    const [ isFirstMessageVisible, setIsFirstMessageVisible ] = useState<boolean>(false);
    const token = getToken();
    const chatId = router.query.id;
    const limit = 10;

    const firstMessageRef = useRef<HTMLDivElement | null>(null);
    const chatBottomRef = useRef<HTMLDivElement | null>(null);
    const chatWrapperRef = useRef<HTMLDivElement | null>(null); 
    const chatWrapperContainer = useRef<HTMLDivElement | null>(null); 
    const lastMessageRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottomInstant = () => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'instant' });
    };

    useEffect(() => {
        if (messagesFetched && messageArray.length > 0 && !isScrolled) {
            setTimeout(() => {
                scrollToBottomInstant();
                setIsScrolled(true)
            }, 100);
        }
    }, [messagesFetched, messageArray, isScrolled]);

    const scrollToBottom = () => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const isLastMessageOnScreen = (lastMessageRef: RefObject<HTMLDivElement>) => { 
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                } else {
                    setIsVisible(false)
                }
            }
        )

        if (lastMessageRef.current) {
            observer.observe(lastMessageRef.current)
        }

        return () => {
            if (lastMessageRef.current) {
                observer.unobserve(lastMessageRef.current);
            }
            observer.disconnect();
        };
    };

    useEffect(() => {
        const disconnect = isLastMessageOnScreen(lastMessageRef);
        if (isScrolled && isVisible) {
            scrollToBottom();
        }
        return () => {
            disconnect(); 
        };
    }, [messageArray, isScrolled, isVisible]);

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
        const handleGetUserData = async () => {
            if (friendId) {
                const response = await axios.post(`${process.env.API_URI}/get-user-data`, {userId: friendId, requiredData: [`username`, `tag`]});
                setFriendData(response.data.user)
            }
        }
        handleGetUserData();
    }, [friendId]);

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
        if (!profile) setProfile(getUserFromCookies());
    }, [user, profile]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (chatId && limit) {
                const response = await axios.post(`${process.env.API_URI}/get-messages`, { chatId, limit, skip: 0 }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response) setMessageArray(response.data.chat?.messages);
                setMessagesFetched(true);
            }
        };
        if (profile?.id) fetchMessages();
    }, [profile, chatId, token]);

    useEffect(() => {
        if (chatId) {
            socket.connect();
            socket.emit('joinRoom', chatId);
    
            socket.on('sendMessageResponse', (msg: IMessage) => {
                setMessageArray((prevMessages) => [msg, ...prevMessages]);
            });
    
            return () => {
                socket.off('sendMessageResponse');
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
                setMessageArray((prevMessages) => [msg, ...prevMessages]);
            });
    
            return () => {
                socket.off('sendMessageWithFilesResponse');
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
            };
        }
    }, [chatId]);

    useEffect(() => {
        setMessageArray([]);
    }, [router]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsFirstMessageVisible(entry.isIntersecting);
            },
            {
                root: null,        
                rootMargin: "0px",
                threshold: 0.1      
            }
        );

        const currentElement = firstMessageRef.current;
        if (currentElement) {
            observer.observe(currentElement);
        }

        return () => {
            if (currentElement) observer.unobserve(currentElement);
            observer.disconnect();
        };
    }, [messageArray]);

    const hasScrolledUpOnce = useRef(false);
    const isNoMoreMessages = useRef<boolean>(false);

    useEffect(() => {
        const container = chatWrapperContainer.current;
        if (container && isFirstMessageVisible && messagesFetched && hasScrolledUpOnce.current && !isNoMoreMessages.current) {
            const fetchMessages = async () => {
                const previousScrollHeight = container.scrollHeight;
                setIsSending(true);

                if (chatId && limit && messageArray.length > 0) {
                    const response = await axios.post(`${process.env.API_URI}/get-messages`, { chatId, limit, skip: messageArray.length }, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (response) {
                        if (response.data.chat.messages.length < limit) {
                            isNoMoreMessages.current = true;
                        }
                        setMessageArray((prev) => {
                            const existingIds = new Set(prev.map(m => m._id));
                            const newMessages = response.data.chat.messages.filter((m: IMessage) => !existingIds.has(m._id));
                            return [...prev, ...newMessages];
                        });

                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                                if (container) {
                                    const newScrollHeight = container.scrollHeight;
                                    const delta = newScrollHeight - previousScrollHeight;
                                    container.scrollTop = delta;
                                    setIsSending(false);
                                }
                            });
                        });
                    }
                }
            };
            
            fetchMessages();
        }
        else if (isFirstMessageVisible && !hasScrolledUpOnce.current) {
            hasScrolledUpOnce.current = true;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFirstMessageVisible, chatId, token, messagesFetched])

    return (
        <Protected>
            <div className={styles.page}>
                <Sidebar currentPage="messanger"/>
                <div className={styles.chatPage}>
                    <div className={styles.header}>
                        { friendId && friendData?.tag &&
                        <Link href={`/profile/${friendData.tag}`}>
                            <UserAvatar className={styles.headerAvatar} id={friendId}/>
                        </Link>
                        }
                        <div>
                            {   friendData && friendData.tag &&
                                <Username className={styles.username} username={friendData.username} tag={friendData.tag}/>
                            }
                            {   user && user.id && friendId &&
                                <UserOnlineStatus friendId={friendId} userId={user.id}/>
                            }
                        </div>
                    </div>
                    <div className={styles.chatContainer} ref={chatWrapperContainer}>
                        {   isSending &&
                            <div className={styles.isSending}>

                            </div>
                        }
                        <div className={styles.chatWrapper} ref={chatWrapperRef}>
                            {[...messageArray]
                            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                            .map((message, index) => {
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            const { ref: _ignored, ...messageProps } = message;
                            return (
                                <Message
                                    key={message._id}
                                    ref={index === 1 ? firstMessageRef : index === messageArray.length - 1 ? lastMessageRef : null}
                                    {...messageProps}
                                />
                            );
                            })}   
                            <div className={styles.commentsEnd} ref={chatBottomRef}></div>             
                        </div>
                        {profile && 
                            <div className={`${styles.form}`}>
                                <MessageForm type="send" user={profile}/>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </Protected>
    );
};

export default Messanger;
