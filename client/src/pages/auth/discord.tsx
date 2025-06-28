import React, { useEffect } from 'react';

const DiscordAuth: React.FC = () => {
  useEffect(() => {
    window.location.href = `https://api.triiiple.ru/auth/discord`;
  }, []);

  return <div>Redirecting to Discord...</div>;
};

export default DiscordAuth;
