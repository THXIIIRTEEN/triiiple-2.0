"use client"

import { getToken } from "@/utils/cookies";
import { useAuthStore } from "@/utils/store";
import axios from "axios";
import { useCallback, useEffect, useState, useRef } from "react";
import Post from "@/components/News/Post";
import { IPost } from "@/types/user";
import MessageForm from "@/components/Messanger/MessageForm/MessageForm";
import { socket } from "@/config/socket";
import Protected from "@/components/Protected";
import Header from "@/components/Header/Header";
import styles from "./styles/news.module.scss";
import Sidebar from "@/components/Sidebar/Sidebar";
import Head from "next/head";

interface INewsProps {
    page?: string;
    profileId?: string;
}

const News: React.FC<INewsProps> = ({page, profileId}) => {
    const token = getToken(); 
    const user = useAuthStore(state => state.user);
    const limit = 5;

    const [ postArray, setPostArray ] = useState<IPost[] | []>([]);
    const [loading, setLoading] = useState(false);
    const [ currentMode, setCurrentMode ] = useState<string | null>(page === "profile" ? null : "news");
    const [ isSending, setIsSending ] = useState<boolean>(false);
    
    const handleGetPosts = useCallback(async (limit: number, skip = 0) => {
        if (!user) return;
        const response = await axios.post(`${process.env.API_URI}/get-posts`, { userId: user.id, profileId, limit, skip, currentMode }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.posts.reverse();
    }, [user, token, profileId, currentMode]);

    useEffect(() => {
        const fetchMessages = async () => {
            const messages = await handleGetPosts(limit);
            if (messages) setPostArray(messages.reverse());
        };

        if (user?.id) fetchMessages();
    }, [user, handleGetPosts]);

    useEffect(() => {
        if (user) {
            socket.connect();
            socket.emit('joinRoom', user.id);
    
            socket.on('sendMessageNewsResponse', (msg: IPost) => {
                setPostArray((prevPosts) => [msg, ...prevPosts]);
            });
    
            return () => {
                socket.off('sendMessageResponse');
            };
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            socket.on('sendPostWithFilesResponse', (msg: IPost) => {
                setPostArray((prevPosts) => [msg, ...prevPosts]);
            });
    
            return () => {
                socket.off('sendPostWithFilesResponse');
            };
        }
    }, [user]);

    interface IMsgDelete {
        messageId: string,
        chatId: string
    }

    useEffect(() => {
        if (user?.id) {
            socket.on('deleteMessageNewsResponse', (msg: IMsgDelete) => {
                setPostArray((prevPosts) => 
                    prevPosts.filter((post) => 
                        post._id !== msg.messageId
                    )
                );
            });
    
            return () => {
                socket.off('deleteMessageNewsResponse');
            };
        }
    }, [user]);

    interface IMsgEdit {
        messageId: string,
        text: string,
        isEdited: true
    }

    useEffect(() => {
        if (user?.id) {
            socket.on('editMessageNewsResponse', (msg: IMsgEdit) => {
                setPostArray((prevPosts) => 
                    prevPosts.map((post) => 
                        post._id === msg.messageId ? { ...post, text: msg.text } : post
                    )
                );
            });
    
            return () => {
                socket.off('editMessageNewsResponse');
            };
        }
    }, [user]);

    const lastPostRef = useRef(null);
    const firstMessageRef = useRef<HTMLDivElement | null>(null);
    const isNoMoreMessages = useRef<boolean>(false);

    const handleGetMoreMessages = useCallback(async () => {
        if (loading || isNoMoreMessages.current) return;
        setLoading(true);
        setIsSending(true);
        const posts = await handleGetPosts(limit, postArray.length);
        if (posts?.length) {
            setPostArray(prev => [...prev, ...posts]);
        }
        if (posts.length < limit) {
            isNoMoreMessages.current = true;
        }
        setLoading(false);
        setIsSending(false);
    }, [loading, postArray.length, handleGetPosts]);

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && lastPostRef.current) {
                handleGetMoreMessages();
            }
        }, { rootMargin: "0px", threshold: 0 });

        if (firstMessageRef.current) observer.observe(firstMessageRef.current);

        return () => observer.disconnect();
    }, [handleGetMoreMessages]);

    useEffect(() => {
        setPostArray([])
    }, [currentMode])

    return (
        <>  
            {   page === "profile" &&
                <>
                {   isSending &&
                    <div className={styles.isSending}>

                    </div>
                }
                { user && !page && <MessageForm type="send" user={user} page="News"/>}
                {postArray &&
                [...postArray]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((post, index) => {
                    const isLast = index === 0; 
                    return (
                        <Post
                        key={post._id}
                        //@ts-expect-error lol
                        ref={isLast ? lastPostRef : null}
                        {...post}
                        />
                    );
                })}
                <div ref={firstMessageRef}></div>
                </>
            }
            { !page &&
                <Protected>
                    <Head>
                        <title>Новости</title>
                        <meta name="description" content="Новости triiiple"/>
                    </Head>
                    <Header/>
                    <div className={styles.page}>
                        <Sidebar currentPage="news"/>
                        <div className={styles.newsPage}>
                            <div className={styles.contentBlock}>
                                <div className={styles.inputNews}>
                                    { user && !page && <MessageForm type="send" user={user} page="News"/>}
                                </div>
                                {   isSending &&
                                    <div className={styles.isSending}>

                                    </div>
                                }
                                {postArray &&
                                [...postArray]
                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                    .map((post, index) => {
                                    const isLast = index === 0; 
                                    return (
                                        <Post
                                        key={post._id}
                                        //@ts-expect-error lol
                                        ref={isLast ? lastPostRef : null}
                                        {...post}
                                        />
                                    );
                                })}
                                <div ref={firstMessageRef}></div>
                                <div className={styles.changeMode}>
                                    <button className={currentMode === "news" ? styles.activeButton : undefined} onClick={() => setCurrentMode("news")}>Новости</button>
                                    <button className={currentMode === "recommendations" ? styles.activeButton : undefined} onClick={() => setCurrentMode("recommendations")}>Рекомендации</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Protected>
            }
        </>
    )
}

export default News;