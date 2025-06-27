import { useEffect } from "react";
import { getToken } from "../utils/cookies";
import { useAuthStore } from "../utils/store";
import { jwtDecode } from "jwt-decode";
import { IUser } from "../types/user";
import { AppProps } from 'next/app';
import { useRouter } from "next/navigation";
import "../globals.css"
import { initializeEmojiData } from "@/utils/emojiInit";
import { socket } from "@/config/socket";
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const MyApp = ({ Component, pageProps }: AppProps) => {

  const { user, setUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    initializeEmojiData();
  }, [Component, pageProps]);

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

  useEffect(() => {
    if (user && user.id) {
      socket.emit("setUserOnlineRequest", { 
        userId: user.id,
        status: "online"
      });
    }
  }, [user]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user && user.id) {
        socket.emit('setUserOnlineRequest', {
          userId: user.id,
          status: "offline",
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (user && user.id) {
          socket.emit('setUserOnlineRequest', {
            userId: user.id,
            status: "offline",
          });
        }
      } else {
        if (user && user.id) {
          socket.emit('setUserOnlineRequest', {
            userId: user.id,
            status: "online",
          });
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  return (
    <div className={inter.variable}>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
