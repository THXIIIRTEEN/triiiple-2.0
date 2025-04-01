import { IPost } from "@/types/user"
import { formateDate } from "@/utils/date";
import UserAvatar from "../UserAvatar";
import { useEffect, useState } from "react";
import { renderMessageWithEmojis } from "../Messanger/Message";
import MessageForm from "../Messanger/MessageForm/MessageForm";
import { useAuthStore } from "@/utils/store";
import FileProvider from "../Messanger/FileProvider";
import FileDownload from "../Messanger/FileDownload";
import { IFile } from "@/types/user";
import PhotoCollage from "../PhotoCollage";
import { socket } from "@/config/socket";

const Post: React.FC<IPost> = (data) => {
    const dateString = formateDate(data.date); 
    const user = useAuthStore(state => state.user); 
    const [editMode, setEditMode] = useState<boolean>(false); 
    const [mediaFiles, setMediaFiles] = useState<IFile[]>([]); 
    const [ likesCount, setLikesCount ] = useState<number>(data.likes.length);
    const [ isLiked, setIsLiked ] = useState<boolean>(data.isLiked);

    const handleDeleteMessage = async () => {
        if (data._id) {
            socket.emit("deleteMessageNewsRequest", {
                messageId: data._id,
                userId: user?.id
            });
        }
    };
    useEffect(() => {
        if (data.files) {
            const filteredFiles = data.files.filter((file) =>
            file.type.startsWith("video") || file.type.startsWith("image")
            );
            setMediaFiles(filteredFiles);
        }
    }, [data.files]);

    console.log(data)

    const handleLikePost = () => {
        if (data._id) {
            socket.emit("likePostNewsRequest", {
                postId: data._id,
                userId: user?.id
            });
        }
    }
    useEffect(() => {
        socket.on('likePostNewsResponse', (postData) => {
            if (postData.postId === data._id) {
                setLikesCount(postData.likesCount);
                setIsLiked(postData.isLiked)
            }
        });

        return () => {
            socket.off('likePostNewsResponse');
        };
    }, [data._id])

    return (
        <div>
            <UserAvatar id={data.author._id} /> 
            <p>{data.author.username}</p>
            <div>{mediaFiles.length > 0 && <PhotoCollage photos={mediaFiles} />}</div>
            <p>{dateString}</p>
            {!editMode ? (
                <p>{renderMessageWithEmojis(data.text)}</p>
            ) : (
                <MessageForm type="edit" user={user!} value={data.text} messageId={data._id} setEditMode={setEditMode} page="News"/>
            )}
            {data.files?.map((file) => {
                if (file.type.split("/")[0] !== "image" && file.type.split("/")[0] !== "video") {
                return (
                    <FileProvider key={file._id} file={file}>
                    {(signedUrl: string) => {
                        if (!signedUrl) {
                        return <div>Loading...</div>;
                        }
                        return <FileDownload file={file} signedUrl={signedUrl} />;
                    }}
                    </FileProvider>
                );
                }
                return null;
            })}
            {user && data.author._id === user.id && (
                <div>
                    <button type="button" onClick={() => setEditMode(!editMode)}>
                        edit
                    </button>
                    <button type="button" onClick={handleDeleteMessage}>
                        delete
                    </button>
                </div>
            )}
            {   isLiked ?
                <button type="button" onClick={() => handleLikePost()}>unlike</button>
                :
                <button type="button" onClick={() => handleLikePost()}>like</button>
            }
            <span>{likesCount}</span>
            <button>comment</button>
        </div>
    )
}

export default Post