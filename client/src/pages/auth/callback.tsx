import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getUserFromCookies, saveToken } from '@/utils/cookies';

const AuthCallback: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (!router.isReady) return;

      const token = router.query.token as string;

      try {
        if (token) {
          saveToken(token);
          const user = getUserFromCookies();

          if (!user) {
            console.error('Пользователь не найден в cookies');
            return;
          }
          if (!user.id) {
            console.error('ID пользователя отсутствует');
            return;
          }

          router.push('/profile');
        } else {
          console.error('No token found in query parameters');
        }
      } catch (error) {
        console.error('Ошибка в handleAuthCallback:', error);
      }
    };

    handleAuthCallback();
  }, [router.isReady, router]);

  return <div>Authenticating...</div>;
};

export default AuthCallback;
