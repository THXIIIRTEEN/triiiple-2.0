import React, { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropImage';

interface ImageCropper {
    getBlob: (blob: Blob) => void,
    inputImg: string | ArrayBuffer | null
}

const ImageCropper: React.FC<ImageCropper> = ({ getBlob, inputImg }) => {
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
            <div className='cropper'>
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    zoomSpeed={0.5}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                />
            </div>
        </>
    )
}

export default ImageCropper;