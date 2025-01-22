import React from "react";
import Image from "next/image";
import { IFile } from "@/types/user";
import photoCollageStyles from '../styles/photo-collage.module.css'
import FileProvider from "./Messanger/FileProvider";

const PhotoCollage = ({ photos }: { photos: IFile[] }) => {
    const collageClass = `photo-collage photos-${photos.length}`;

    return (
        <div className={`${photoCollageStyles['photo-collage']} ${collageClass} ${photoCollageStyles['photos-flex']}`}>        
        {photos.map((photo, index) => {
            if (photo.type.split("/")[0] === "video") {
                return (
                    <FileProvider key={index} file={photo}>
                        {(signedUrl: string) => {
                            if (!signedUrl) {
                                return <div>Loading...</div>;
                            }

                            return (
                                <video
                                    key={index}
                                    src={signedUrl}
                                    controls
                                />
                            );
                        }}
                    </FileProvider>
                );
        }
        else if (photo.type.split("/")[0] === "image") {
            return (
                <FileProvider key={index} file={photo}>
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
            );
        } 
        return null; 
    })}
    </div>
  );
};

export default PhotoCollage;
