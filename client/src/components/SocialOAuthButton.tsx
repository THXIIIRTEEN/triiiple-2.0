import { signIn, signOut, useSession } from 'next-auth/react';

const SocialOAuthButton: React.FC = () => {
    const { data: session } = useSession();

  return (
    <div>
      {!session ? (
        <div>
          <button onClick={() => signIn('github')}>Sign in with GitHub</button>
          <button onClick={() => signIn('discord')}>Sign in with Discord</button>
        </div>
      ) : (
        <button onClick={() => signOut()}>Sign out</button>
      )}
    </div>
  );
}

export default SocialOAuthButton;