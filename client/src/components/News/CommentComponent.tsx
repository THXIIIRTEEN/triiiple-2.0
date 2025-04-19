import { IComment, IFile } from "@/types/user";
import FileProvider from "../Messanger/FileProvider";
import FileDownload from "../Messanger/FileDownload";
import { useEffect, useState } from "react";
import PhotoCollage from "../PhotoCollage";
import UserAvatar from "../UserAvatar";
import { renderMessageWithEmojis } from "../Messanger/Message";
import MessageForm from "../Messanger/MessageForm/MessageForm";
import { useAuthStore } from "@/utils/store";
import { formateDate } from "@/utils/date";
import { socket } from "@/config/socket";

const CommentComponent: React.FC<IComment> = (props) => {
    const { _id, author, text, isEdited, date, postId } = props;
    const user = useAuthStore((state) => state.user); 
    const [mediaFiles, setMediaFiles] = useState<IFile[]>([]); 
    const [editMode, setEditMode] = useState<boolean>(false);
    const [dateString, setDateString] = useState<string>(formateDate(date))

    useEffect(() => {
        const dateToString = formateDate(date);
        setDateString(dateToString);
    }, [date]);
    
    useEffect(() => {
        if (props.files) {
            const filteredFiles = props.files.filter((file) =>
            file.type.startsWith("video") || file.type.startsWith("image")
            );
            setMediaFiles(filteredFiles);
        }
    }, [props.files]); 

    const handleDeleteMessage = async () => { 
        if (_id) {
            socket.emit("deleteCommentNewsRequest", {
                messageId: _id,
                postId: postId
            });
        }
    };

    return (
        <div> 
            <UserAvatar id={author._id} />
            <p>{author.username}</p>
            <div>{mediaFiles.length > 0 && <PhotoCollage photos={mediaFiles} />}</div>
            {!editMode ? (
                <p>{renderMessageWithEmojis(text)}</p>
            ) : (
                <MessageForm type="edit" user={user!} value={text} messageId={_id} setEditMode={setEditMode} postId={postId} page="Comment"/>
            )}
            {props.files?.map((file) => {
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
            {isEdited && <p>ред.</p>}
            <span>{dateString}</span>
            {author._id === user?.id && (
                <div>
                <button type="button" onClick={() => setEditMode(!editMode)}>
                    edit
                </button>
                <button type="button" onClick={handleDeleteMessage}>
                    delete
                </button>
                </div>
            )}
        </div>
    );
}

export default CommentComponent;
