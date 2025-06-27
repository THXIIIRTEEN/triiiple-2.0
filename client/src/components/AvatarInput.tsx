import React, { useState } from 'react';
import axios from 'axios';
import { getToken } from '@/utils/cookies';
import ImageCropper from './ImageCropper';
import { useRouter } from 'next/router';
import { IUser } from '@/types/user';
import styles from "./styles/cropper.module.scss"

interface AvatarInputProps {
    user: IUser | null;
    className?: string;
    onMouseLeave?: React.MouseEventHandler<HTMLFormElement>;
}

const AvatarInput: React.FC<AvatarInputProps> = ({ user, className, onMouseLeave }) => {

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [blob, setBlob] = useState<Blob | null>(null)
    const [inputImg, setInputImg] = useState<string | ArrayBuffer | null>('')

    const token = getToken();
    const router = useRouter();

    const getBlob = (blob: Blob) => {
        setBlob(blob)
    }

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files![0];
        const reader = new FileReader();

        if (file && file.type.startsWith('image/')) {
            reader.addEventListener('load', () => {
                setInputImg(reader.result)
            }, false)

            if (file) {
                reader.readAsDataURL(file)
            }
            setErrorMessage(null);
          } else {
            setErrorMessage('Пожалуйста выберите изображение');
          }
    };

    const handleUploadAvatar = async () => {

        if (!blob) {
            setErrorMessage('Кажется вы не загрузили изображение');
            return;
        }

        if (user && user.id) {
            const formData = new FormData();
            formData.append('file', blob);
            formData.append('userId', user.id);

            try {
                await axios.post(`${process.env.API_URI}/avatar/upload`, formData, {
                    headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                    },
                }).then((response) => {
                    if (response.status === 200) {
                        sessionStorage.removeItem(`avatar-${user.id}`);
                        router.reload();
                    }
                });
            }
            catch (error) {
                setErrorMessage(`Ошибка при загрузке аватара: ${error}`)
            }
        }

    }

    return (
        <>
            <form action="#" className={className} onMouseLeave={inputImg ? undefined : onMouseLeave}>
                <label htmlFor="upload" style={{ cursor: 'pointer' }}>
                    <div>
                        <svg width="35" height="30" viewBox="0 0 35 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.5 9.75C1.5 7.817 3.09188 6.25 5.05556 6.25H7.72222C8.84135 6.25 9.89518 5.73132 10.5667 4.85L12.4333 2.4C13.1048 1.51868 14.1587 1 15.2778 1H19.7222C20.8413 1 21.8952 1.51868 22.5667 2.4L24.4333 4.85C25.1048 5.73132 26.1587 6.25 27.2778 6.25H29.9444C31.9082 6.25 33.5 7.817 33.5 9.75V25.5C33.5 27.433 31.9082 29 29.9444 29H5.05556C3.09188 29 1.5 27.433 1.5 25.5V9.75Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M17.5 24C21.366 24 24.5 20.866 24.5 17C24.5 13.134 21.366 10 17.5 10C13.634 10 10.5 13.134 10.5 17C10.5 20.866 13.634 24 17.5 24Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </label>
                <input accept='image/*' type="file" id="upload" style={{ display: 'none' }} onChange={handleAvatarChange}>
                

                </input>
                { errorMessage && 
                    <p>{errorMessage}</p>
                }
                
            </form>
            { inputImg && (
                <>
                    {/* @ts-expect-error lol */}
                    <ImageCropper getBlob={getBlob} inputImg={inputImg} closeFunction={onMouseLeave}/>
                    <button className={styles.submit} type='button' onClick={handleUploadAvatar}>Принять</button>
                </>
            )}
        </>
    )
};

export default AvatarInput;