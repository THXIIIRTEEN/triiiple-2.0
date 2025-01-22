import { IFile } from "@/types/user";
import axios from "axios";
import { useEffect, useState } from "react";

const FileProvider: React.FC<{ children: (data: string) => JSX.Element, file: IFile }> = ({ children, file }) => {

    const [ signedUrl, setSignedUrl ] = useState(null)

    useEffect(() => {
        const getSignedUrl = async () => {
            const res = await axios.post(`${process.env.API_URI}/get-signed-url`, {fileUrl: file.url});
            setSignedUrl(res.data.signedUrl);
        }
        getSignedUrl();
    }, [signedUrl, file.url]);

    return (
        <>
            {children(signedUrl!)}
        </>
    )
}

export default FileProvider;