import React, { useEffect } from 'react';

const GitHubAuth: React.FC = () => {
  useEffect(() => {
    window.location.href = `${process.env.API_URI}/auth/google`;
  }, []);

  return <div>Redirecting to Google...</div>;
};

export default GitHubAuth;
