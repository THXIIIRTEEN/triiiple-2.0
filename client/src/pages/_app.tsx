import { useEffect } from "react";
import { getToken } from "../utils/cookies";
import { useAuthStore } from "../utils/store";
import { jwtDecode } from "jwt-decode";
import { IUser } from "../types/user";
import { AppProps } from 'next/app';
import { useRouter } from "next/navigation";
import "../globals.css"

const MyApp = ({ Component, pageProps }: AppProps) => {
  const { user, setUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (token && !user) {
      try {
        const decodedUser = jwtDecode<IUser>(token);
        setUser(decodedUser);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, [user, setUser, router]);

  return (
    <Component {...pageProps} />
  );
}

export default MyApp;
