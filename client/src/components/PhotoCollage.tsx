import React from "react";
import Image from "next/image";
import { IFile } from "@/types/user";
import photoCollageStyles from "../styles/photo-collage.module.css"; 
import FileProvider from "./Messanger/FileProvider";

const PhotoCollage = ({ photos }: { photos: IFile[] }) => {

  const getCollageClass = (photos: IFile[]) => {
    if (photos.length === 1) {
        return "single-photo"
    }
    if (photos.length === 2) {
        return "double-photo"
    }
    const remainder = photos.length % 3;
    if (remainder === 1) {
        return "photos-1"
    }; 
    if (remainder === 2) {
        return "photos-2"
    };
    return "photos-0"; 
  };

  const collageClass = getCollageClass(photos);

  return (
    <div className={`${photoCollageStyles["photo-collage"]} ${photoCollageStyles[collageClass]}`}>
      {photos.map((photo, index) => {
        if (photo.type.startsWith("video")) {
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
                    className={photoCollageStyles.collageItem}
                  />
                );
              }}
            </FileProvider>
          );
        } else if (photo.type.startsWith("image")) {
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
                    className={photoCollageStyles.collageItem}
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
