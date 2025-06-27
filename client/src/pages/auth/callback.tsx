import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getUserFromCookies, removeToken, saveToken } from '@/utils/cookies';
import { jwtDecode } from 'jwt-decode';
import { useAuthStore } from '@/utils/store';
import { IUser } from '@/types/user';

const AuthCallback: React.FC = () => {
  const router = useRouter();
  const { setUser } = useAuthStore(); 

  useEffect(() => {
    const handleAuthCallback = async () => {

      const token = router.query.token as string;
      try {
        if (token) {
          removeToken();
          saveToken(token);
          if (token) {
              const decodedUser = jwtDecode<IUser>(token); 
              setUser(decodedUser); 
          }
          const user = getUserFromCookies(); 
          if (!user) {
            console.error('Пользователь не найден в cookies');
            return;
          }
          if (!user.id) {
            console.error('ID пользователя отсутствует');
            return;
          }
          router.push(`/profile/${user.tag}`);
        } else {
          console.error('No token found in query parameters');
        }
      } catch (error) {
        console.error('Ошибка в handleAuthCallback:', error);
      }
    };

    handleAuthCallback();
  }, [router.isReady, router, setUser]);

  return <div>Authenticating...</div>;
};

export default AuthCallback;
