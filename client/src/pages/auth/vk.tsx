import React, { useEffect } from 'react';

const GitHubAuth: React.FC = () => {
  useEffect(() => {
    window.location.href = `https://api.triiiple.ru/auth/vk`;
  }, []);

  return <div>Redirecting to VK...</div>;
};

export default GitHubAuth;
