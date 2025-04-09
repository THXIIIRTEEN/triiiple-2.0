import { IComment, IFile } from "@/types/user";
import FileProvider from "../Messanger/FileProvider";
import FileDownload from "../Messanger/FileDownload";
import { useEffect, useState } from "react";
import PhotoCollage from "../PhotoCollage";

const CommentComponent: React.FC<IComment> = (props) => {
    const [mediaFiles, setMediaFiles] = useState<IFile[]>([]); 
    useEffect(() => {
        if (props.files) {
            const filteredFiles = props.files.filter((file) =>
            file.type.startsWith("video") || file.type.startsWith("image")
            );
            setMediaFiles(filteredFiles);
        }
    }, [props.files]);
    return (
        <div> 
            <div>{mediaFiles.length > 0 && <PhotoCollage photos={mediaFiles} />}</div>
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
            <p>{props.text}</p>
        </div>
    );
}

export default CommentComponent;
