"use client"

import { getToken } from "@/utils/cookies";
import { useAuthStore } from "@/utils/store";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import Post from "@/components/News/Post";
import { IPost } from "@/types/user";
import MessageForm from "@/components/Messanger/MessageForm/MessageForm";
import { socket } from "@/config/socket";

const News: React.FC = () => {
    const token = getToken(); 
    const user = useAuthStore(state => state.user);
    const limit = 5;

    const [ postArray, setPostArray ] = useState<IPost[] | []>([]);
    
    const handleGetPosts = useCallback(async (limit: number, skip = 0) => {
        if (!user) return;
        const response = await axios.post(`${process.env.API_URI}/get-posts`, { userId: user.id, limit, skip }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.posts.reverse();
    }, [user, token]);

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
            socket.on('sendMessageWithFilesResponse', (msg: IPost) => {
                setPostArray((prevPosts) => [msg, ...prevPosts]);
            });
    
            return () => {
                socket.off('sendMessageWithFilesResponse');
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
                console.log("EDIT")
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

    return (
        <>  
            { user && <MessageForm type="send" user={user} page="News"/>}
            {   postArray && postArray.map((post) => {
                return (
                    <Post {...post} key={post._id}/>
                )
            })
            }
        </>
    )
}

export default News;