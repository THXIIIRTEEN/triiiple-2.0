import React, { useEffect } from 'react';

const GitHubAuth: React.FC = () => {
  useEffect(() => {
    window.location.href = `${process.env.API_URI}/auth/vk`;
  }, []);

  return <div>Redirecting to VK...</div>;
};

export default GitHubAuth;
