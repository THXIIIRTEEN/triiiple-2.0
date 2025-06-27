import { getToken } from "@/utils/cookies";
import axios from "axios";
import { Dispatch, RefObject, SetStateAction, useEffect, useRef, useState } from "react";
import CommentComponent from "./CommentComponent";
import { useAuthStore } from "@/utils/store";
import MessageForm from "../Messanger/MessageForm/MessageForm";
import { socket } from "@/config/socket";
import styles from './styles/comment.module.scss'
import { IComment } from "./CommentComponent";

export interface ICommentListProps {
    postId: string;
    setCommentCount: Dispatch<SetStateAction<number>>;
    setIsCommentsVisible: Dispatch<SetStateAction<boolean>>;
}

const CommentList: React.FC<ICommentListProps> = ({postId, setCommentCount, setIsCommentsVisible}) => {
    const token = getToken(); 
    const user = useAuthStore(state => state.user); 
    const limit = 10;

    const [ commentArray, setCommentArray ] = useState<IComment[]>([]);
    const [ isScrolled, setIsScrolled ] = useState<boolean>(false);
    const [ isVisible, setIsVisible ] = useState<boolean>(false);
    const [ isSending, setIsSending ] = useState<boolean>(false);
    const [ isFirstMessageVisible, setIsFirstMessageVisible ] = useState<boolean>(false);
    const [ messagesFetched, setMessagesFetched ] = useState<boolean>(false);

    const firstMessageRef = useRef<HTMLDivElement>(null);

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
    }, [commentArray]);

    const hasScrolledUpOnce = useRef(false);
    const isNoMoreMessages = useRef<boolean>(false);

    useEffect(() => {
        const container = popover.current;
        if (container && isFirstMessageVisible && messagesFetched && hasScrolledUpOnce.current && !isNoMoreMessages.current) {
            const fetchMessages = async () => {
                const previousScrollHeight = container.scrollHeight;
                setIsSending(true);

                if (postId && limit && commentArray.length > 0) {
                    const response = await axios.post(`${process.env.API_URI}/get-comments`, { postId, limit, skip: commentArray.length }, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (response) {
                        if (response.data.comments.length < limit) {
                            isNoMoreMessages.current = true;
                        }
                        setCommentArray((prev) => {
                            const existingIds = new Set(prev.map(m => m._id));
                            const newMessages = response.data.comments.filter((m: IComment) => !existingIds.has(m._id));
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
    }, [isFirstMessageVisible, postId, token, messagesFetched])

    useEffect(() => {
        const fetchMessages = async () => {
            if (postId && limit) {
                const response = await axios.post(`${process.env.API_URI}/get-comments`, { postId, limit, skip: 0 }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response) {
                    console.log(response.data)
                    setCommentArray(response.data.comments);
                }
                setMessagesFetched(true);
            }
        };
        if (user?.id) fetchMessages();
    }, [user, postId, token]);

    useEffect(() => {
        if (!user) return;

        socket.connect();
        socket.emit('joinRoom', user.id);

        const onMessage = (msg: IComment) => {
            setCommentArray(prev => [...prev, msg]);
            setCommentCount(prev => prev + 1)
        };

        socket.on('sendMessageCommentResponse', onMessage);

        socket.on('sendCommentWithFilesResponse', onMessage);

        return () => {
            socket.off('sendMessageCommentResponse', onMessage);
            socket.off('sendCommentWithFilesResponse'); 
        };

    }, [user, setCommentCount]);

    interface IMsgDelete {
        messageId: string,
        chatId: string
    }

    useEffect(() => {
        if (user?.id) {
            socket.on('deleteCommentNewsResponse', (msg: IMsgDelete) => {
                setCommentArray((prevComments) => 
                    prevComments.filter((comment) => 
                        comment._id !== msg.messageId
                    )
                );
                setCommentCount(prev => prev - 1)
            });
    
            return () => {
                socket.off('deleteCommentNewsResponse');
            };
        }
    }, [user, setCommentCount]);

    interface IMsgEdit {
        messageId: string,
        text: string,
        isEdited: true,
        postId: string
    }

    useEffect(() => {
        if (user?.id) {
            socket.on('editMessageCommentResponse', (msg: IMsgEdit) => {
                setCommentArray((prevComments) => 
                    prevComments.map((comment) => 
                        comment._id === msg.messageId ? { ...comment, text: msg.text, isEdited: true } : comment
                    )
                );
            });
    
            return () => {
                socket.off('editMessageCommentResponse');
            };
        }
    }, [user]);

    const popover = useRef<HTMLDivElement>(null); 

    const handleClickOutside = (event: MouseEvent) => {
        if (popover.current && !popover.current.contains(event.target as Node)) {
            setIsCommentsVisible(false); 
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
    
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []); 

    const commentsEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottomInstant = () => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'instant' });
    };

    useEffect(() => {
        if (messagesFetched && commentArray.length > 0 && !isScrolled) {
            setTimeout(() => {
                scrollToBottomInstant();
                setIsScrolled(true)
            }, 100);
        }
    }, [messagesFetched, commentArray, isScrolled]);

    const lastMessageRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    }, [commentArray, isScrolled, isVisible]);

    return ( 
        <div className={styles.background}>
            <div className={styles.block} ref={popover}>
                {   isSending &&
                    <div className={styles.isSending}>

                    </div>
                }
                <div className={styles.titleBlock}>
                    <p className={styles.title}>Комментарии</p>
                </div>
                {[...commentArray]
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((comment, index) => {
                    const isFirst = index === 0;
                    const isLast = index === commentArray.length - 1;
                    return (
                    <CommentComponent
                        key={comment._id}
                        ref={isFirst ? firstMessageRef : isLast ? lastMessageRef : null}
                        {...comment}
                    />
                    );
                })}
                { user && <MessageForm key={postId} className={styles.commentInput} type="send" user={user} page="Comment" postId={postId}/>}
                <div className={styles.commentsEnd} ref={commentsEndRef}></div>
            </div>
            
        </div>
    );
}

export default CommentList;