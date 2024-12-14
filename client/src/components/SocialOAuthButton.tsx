import { useRouter } from 'next/router';

const SocialOAuthButton: React.FC = () => {
  const router = useRouter();

  return (
    <div>
        <div>
          <button onClick={() => router.push('/api/auth/github')}>Sign in with GitHub</button>
          <button onClick={() => router.push('/api/auth/discord')}>Sign in with Discord</button>
        </div>
    </div>
  );
}

export default SocialOAuthButton;