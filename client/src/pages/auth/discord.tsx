import React, { useEffect } from 'react';

const DiscordAuth: React.FC = () => {
  useEffect(() => {
    window.location.href = `${process.env.API_URI}/auth/discord`;
  }, []);

  return <div>Redirecting to Discord...</div>;
};

export default DiscordAuth;
