import { IFile } from "@/types/user";
import axios from "axios";
import { useEffect, useState } from "react";
import { useInView } from 'react-intersection-observer';

const FileProvider: React.FC<{ children: (data: string) => JSX.Element, file: IFile }> = ({ children, file }) => {

    const [ signedUrl, setSignedUrl ] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1, 
    });

    if (inView && !isVisible) {
        setIsVisible(true);
    }

    useEffect(() => {
        if (inView && !signedUrl) { 
            const getSignedUrl = async () => {
                try {
                    const res = await axios.post(`${process.env.API_URI}/get-signed-url`, { fileUrl: file.url });
                    setSignedUrl(res.data.signedUrl);
                } catch (error) {
                    console.error("Error fetching signed URL:", error);
                }
            };
            getSignedUrl();
        }
    }, [signedUrl, file.url, inView]);

    return (
        <div ref={ref}>
            {signedUrl && children(signedUrl)}
        </div>
    )
}

export default FileProvider;