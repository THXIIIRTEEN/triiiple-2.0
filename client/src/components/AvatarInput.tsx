import React, { useState } from 'react';
import axios from 'axios';
import { User } from '../utils/store';
import { getToken } from '@/utils/cookies';
import ImageCropper from './ImageCropper';
import { useRouter } from 'next/router';

interface AvatarInputProps {
    user: User | null;
}

const AvatarInput: React.FC<AvatarInputProps> = ({ user }) => {

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

        const formData = new FormData();
        formData.append('file', blob);
        formData.append('userId', user!.id);

        try {
            await axios.post(`${process.env.API_URI}/avatar/upload`, formData, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                  'Authorization': `Bearer ${token}`,
                },
            }).then((response) => {
                if (response.status === 200) {
                    router.reload();
                }
            });
        }
        catch (error) {
            setErrorMessage(`Ошибка при загрузке аватара: ${error}`)
        }

    }

    return (
        <>
            <form action="#" onSubmit={handleUploadAvatar}>
                <input accept='image/*' type="file" onChange={handleAvatarChange}></input>
                { errorMessage && 
                    <p>{errorMessage}</p>
                }
                { inputImg && (
                    <ImageCropper getBlob={getBlob} inputImg={inputImg}/>
                )}
                <button className='submit' type='submit'>Submit</button>
            </form>
        </>
    )
};

export default AvatarInput;