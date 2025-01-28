import { IFile } from "@/types/user";
import FileProvider from "../FileProvider";
import Image from "next/image";

const MediaView: React.FC<{file: IFile}> = ({ file }) => {

    return (
        <>
            {
                file.type.startsWith('video') &&
                    <FileProvider file={file}>
                        {(signedUrl: string) => {
                            if (!signedUrl) {
                                return <div>Loading...</div>;
                            }
                            return (
                                <video
                                    src={signedUrl}
                                    controls
                                />
                            );
                        }}
                    </FileProvider>
            }
            {
                file.type.startsWith('image') &&
                <FileProvider file={file}>
                    {(signedUrl: string) => {
                        if (!signedUrl) {
                            return <div>Loading...</div>;
                        }
                        return (
                            <Image
                                src={signedUrl}
                                alt="Photo"
                                width={200}
                                height={200}
                            />
                        );
                    }}
                </FileProvider>
            }
        </>
    );
}

export default MediaView;