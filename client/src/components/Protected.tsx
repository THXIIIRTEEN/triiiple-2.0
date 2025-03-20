import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { getToken } from '@/utils/cookies';

interface ProtectedProps {
  children: ReactNode;
}

const Protected: React.FC<ProtectedProps> = ({ children }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const sendAuthentificationToken = async () => {
        const token = getToken(); 

        if (!token) {
            router.push('/login'); 
            setLoading(false);
            return;
        }
        await axios.post(`${process.env.API_URI}/protected`, null, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
        })
        .then(() => {
            setIsAuthenticated(true);
            setLoading(false);
        })
        .catch(() => {
            router.push('/login'); 
            setIsAuthenticated(false);
            setLoading(false);
        });
    }
    sendAuthentificationToken();
  }, [router]);

  

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default Protected;
