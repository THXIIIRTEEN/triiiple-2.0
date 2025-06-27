import { IFile } from "@/types/user";
import styles from "./styles/filedownload.module.scss"

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
        <div className={styles.block}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                <path d="M19 9V17.8C19 18.9201 19 19.4802 18.782 19.908C18.5903 20.2843 18.2843 20.5903 17.908 20.782C17.4802 21 16.9201 21 15.8 21H8.2C7.07989 21 6.51984 21 6.09202 20.782C5.71569 20.5903 5.40973 20.2843 5.21799 19.908C5 19.4802 5 18.9201 5 17.8V6.2C5 5.07989 5 4.51984 5.21799 4.09202C5.40973 3.71569 5.71569 3.40973 6.09202 3.21799C6.51984 3 7.0799 3 8.2 3H13M19 9L13 3M19 9H14C13.4477 9 13 8.55228 13 8V3" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <a href={signedUrl!}>
                <p>{file.name}</p>
            </a>
            <button onClick={() => downloadFile(signedUrl!)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <title/>
                    <g id="Complete">
                    <g id="download">
                    <g>
                    <path d="M3,12.3v7a2,2,0,0,0,2,2H19a2,2,0,0,0,2-2v-7" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                    <g>
                    <polyline data-name="Right" fill="none" id="Right-2" points="7.9 12.3 12 16.3 16.1 12.3" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                    <line fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="12" x2="12" y1="2.7" y2="14.2"/>
                    </g>
                    </g>
                    </g>
                    </g>
                </svg>
                Скачать
            </button>
        </div>
    );
};

export default FileDownload;