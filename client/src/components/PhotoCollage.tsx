import React from "react";
import Image from "next/image";
import { IFile } from "@/types/user";
import photoCollageStyles from '../styles/photo-collage.module.css'

const PhotoCollage = ({ photos }: { photos: IFile[] }) => {
    const collageClass = `photo-collage photos-${photos.length}`;

    return (
        <div className={`${photoCollageStyles['photo-collage']} ${collageClass} ${photoCollageStyles['photos-flex']}`}>        
        {photos.map((photo, index) => {
            if (photo.type.split("/")[0] === "video") {
                return (
                    <video
                        key={index}
                        src={photo.url}
                        controls
                    />
                );
        }
        else if (photo.type.split("/")[0] === "image") {
            return (
                <Image
                    key={index}
                    src={photo.url}
                    alt={`Photo ${index + 1}`}
                    width={200} 
                    height={200}
                />
            );
        } 
        return null; 
    })}
    </div>
  );
};

export default PhotoCollage;
