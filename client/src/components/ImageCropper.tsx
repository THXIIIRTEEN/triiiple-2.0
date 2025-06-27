import React, { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropImage';
import styles from "./styles/cropper.module.scss"

interface ImageCropper {
    getBlob: (blob: Blob) => void,
    inputImg: string | ArrayBuffer | null,
    closeFunction: React.MouseEventHandler<HTMLFormElement>;
}

const ImageCropper: React.FC<ImageCropper> = ({ getBlob, inputImg, closeFunction }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);

    const onCropComplete = useCallback(async (croppedArea: Area, croppedAreaPixels: Area) => {
        if (typeof inputImg === 'string') {
            const croppedImage = await getCroppedImg(inputImg, croppedAreaPixels);
            getBlob(croppedImage as Blob);
        }
    }, [getBlob, inputImg]);

    const imageSrc = typeof inputImg === 'string' ? inputImg : undefined;

    return (
        <>
            <div className={styles.cropper}>
                <div className={styles.cropperContent}>
                    {/* @ts-expect-error lol */}
                    <button className={styles.closeButton} onClick={closeFunction}>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16 8L8 16M8.00001 8L16 16" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></g></svg>
                    </button>
                    <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    zoomSpeed={0.1}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                    cropShape='round'
                />
                </div>
            </div>
        </>
    )
}

export default ImageCropper;