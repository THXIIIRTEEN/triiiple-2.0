import React, { useEffect } from 'react';

const GitHubAuth: React.FC = () => {
  useEffect(() => {
    window.location.href = `${process.env.API_URI}/auth/github`;
  }, []);

  return <div>Redirecting to GitHub...</div>;
};

export default GitHubAuth;
