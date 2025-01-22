import { IFile } from "@/types/user";

interface IFileLinkProps {
    file: IFile;
    signedUrl: string
}

const FileDownload: React.FC<IFileLinkProps> = ({ file, signedUrl }) => {

    const downloadFile = async (signedUrl: string) => {
        const imageResponse = await fetch(signedUrl);
        console.log(imageResponse)
        const imageBlob = await imageResponse.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(imageBlob); 
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };  

    return (
        <div>
            <a href={signedUrl!}>
                <p>{file.name}</p>
            </a>
            <button onClick={() => downloadFile(signedUrl!)}>download</button>
        </div>
    );
};

export default FileDownload;