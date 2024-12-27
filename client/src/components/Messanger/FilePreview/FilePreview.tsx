import Image from "next/image";
import { useEffect, useState } from "react";

interface FilePreviewProps {
    file: File;
    setFiles: React.Dispatch<React.SetStateAction<File[]>>
}

const FilePreview: React.FC<FilePreviewProps> = ({ setFiles, file }) => {

    const [ image, setImage ] = useState<string | null>(null);

    useEffect(() => {
        if (file) {
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                  if (e.target) {
                    setImage(e.target.result as string);
                  }
                };
                reader.readAsDataURL(file);
              }
        
        }
    }, [file]);

    const deleteFile = (file: File) => {
        if (file) {
            setFiles((prevFiles: File[]) => 
                prevFiles.filter((files: File) => 
                    files.name !== file.name
                )
            )
        }
    }

    return (
        <div>
            {   image &&
                <Image src={image} alt="preview" width={200} height={200}></Image>
            }
            <p>{file?.name}</p>
            <button type="button" onClick={() => deleteFile(file)}>delete</button>
        </div>
    )
};

export default FilePreview;