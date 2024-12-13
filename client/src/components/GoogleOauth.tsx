import { GoogleOAuthProvider, GoogleLogin, CredentialResponse  } from '@react-oauth/google';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { saveToken } from '@/utils/cookies';

const GoogleOuath: React.FC = () => {

    const [ error, setError ] = useState<string | null>(null);
    const router = useRouter();

    const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

    const onSuccess = async (response: CredentialResponse) => {
        try {
            await axios.post(`${process.env.API_URI}/google/auth`, {
                token: response.credential
            }).then((response) => {
                if (response.status === 200) {
                    setError(null);
                    saveToken(response.data.token);
                    router.push('/profile');
                }
            });
        }
        catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setError(`Произошла ошибка при авторизации: ${error.message}`)
            }
            else {
                setError('Неизвестная ошибка')
            }
        }
    };

    const onError = () => {
        setError('Произошла ошибка при авторизации');
    };

    return (
        <GoogleOAuthProvider clientId={CLIENT_ID}>
            <GoogleLogin
                onSuccess={onSuccess}
                onError={onError}
            />
            {   error && 
                <p>{error}</p>
            }
        </GoogleOAuthProvider>
    )
}

export default GoogleOuath;