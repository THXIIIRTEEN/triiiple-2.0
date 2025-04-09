import { IComment } from "@/types/user";
import { getToken } from "@/utils/cookies";
import axios from "axios";
import { useEffect, useState } from "react";
import CommentComponent from "./CommentComponent";
import { useAuthStore } from "@/utils/store";
import MessageForm from "../Messanger/MessageForm/MessageForm";
import { socket } from "@/config/socket";

export interface ICommentListProps {
    postId: string
}

const CommentList: React.FC<ICommentListProps> = ({postId}) => {
    const token = getToken(); 
    const user = useAuthStore(state => state.user); 

    const [ commentArray, setCommentArray ] = useState<IComment[]>([])
    
    useEffect(() => {
        const fetchComments = async () => {
            if (!postId) return;
            const response = await axios.post(`${process.env.API_URI}/get-comments`, {postId}, {
                headers: { Authorization: `Bearer ${token}` }, 
            });
            setCommentArray(response.data.comments)
        }
        fetchComments();
    }, [postId, token]);

    useEffect(() => {
        if (user) {
            socket.connect();
            socket.emit('joinRoom', user.id);
    
            socket.on('sendMessageCommentResponse', (msg: IComment) => {
                setCommentArray((prevComments) => [msg, ...prevComments]);
            });
    
            return () => {
                socket.off('sendMessageResponse');
            };
        }
    }, [user]); 

        useEffect(() => {
            if (user) {
                socket.on('sendCommentWithFilesResponse', (msg: IComment) => {
                    setCommentArray((prevComments) => [msg, ...prevComments]);
                });
        
                return () => {
                    socket.off('sendCommentWithFilesResponse');
                };
            }
        }, [user]);

    return ( 
        <div>
            <p>Комментарии</p>
            { user && <MessageForm type="send" user={user} page="Comment" postId={postId}/>}
            {   commentArray.length > 0 && commentArray.map((comment) => {
                    return ( 
                        <CommentComponent {...comment} key={comment._id}/>
                    )
                })
            }

        </div>
    );
}

export default CommentList;