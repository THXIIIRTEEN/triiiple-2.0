import Image from "next/image";
import { useEffect, useState } from "react";

interface FilePreviewProps {
    file: File | null
}

const FilePreview: React.FC<FilePreviewProps> = ({ file }) => {

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
    }, [file])

    return (
        <div>
            {   image &&
                <Image src={image} alt="preview" width={200} height={200}></Image>
            }
            <p>{file?.name}</p>
        </div>
    )
};

export default FilePreview;