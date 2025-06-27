import React, { useState } from "react";
import Image from "next/image";
import { IFile } from "@/types/user";
import photoCollageStyles from "../styles/photo-collage.module.css"; 
import FileProvider from "./Messanger/FileProvider";
import MediaView from "./Messanger/MediaCarousel/MediaView";
import MediaCarousel from "./Messanger/MediaCarousel/MediaCarousel";

const PhotoCollage = ({ photos, className }: { photos: IFile[], className?: string }) => {

  const [ currentlyMediaView, setCurrentlyMediaView ] = useState<IFile | null>(null);

  const getCollageClass = (photos: IFile[]) => {
    if (photos.length === 1) {
        return "single-photo";
    }
    if (photos.length === 2) {
        return "double-photo";
    }
    const remainder = photos.length % 3;
    if (remainder === 1) {
        return "photos-1";
    }; 
    if (remainder === 2) {
        return "photos-2";
    };
    return "photos-0"; 
  };

  const collageClass = getCollageClass(photos);

  const handleMediaClick = (photo: IFile) => {
    setCurrentlyMediaView(photo)
  }

  return (
    <div 
      className={`${photoCollageStyles["photo-collage"]} ${photoCollageStyles[collageClass]} ${className}`}
    >
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
                    className={photoCollageStyles.collageItem}
                    onClick={() => handleMediaClick(photo)}
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
                    onClick={() => handleMediaClick(photo)}
                  />
                );
              }}
            </FileProvider>
          );
        }
        return null;
      })}
      {
        currentlyMediaView && 
          <MediaCarousel files={photos} currentlyMediaView={currentlyMediaView} setCurrentlyMediaView={setCurrentlyMediaView}>
            <MediaView key={currentlyMediaView._id} file={currentlyMediaView}/>
          </MediaCarousel>
      }    
    </div>
  );
};

export default PhotoCollage;
