import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { saveToken } from '@/utils/cookies';

const AuthCallback: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const token = router.query.token as string;

      if (token) {
        saveToken(token);

        router.push('/profile');
      } else {
        console.error('No token found in query parameters');
      }
    };

    handleAuthCallback();
  }, [router]);

  return <div>Authenticating...</div>;
};

export default AuthCallback;
