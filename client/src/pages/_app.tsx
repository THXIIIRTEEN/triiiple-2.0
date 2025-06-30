import { useEffect } from "react";
import { getToken } from "../utils/cookies";
import { useAuthStore, useChatStore } from "../utils/store";
import { jwtDecode } from "jwt-decode";
import { IUser } from "../types/user";
import { AppProps } from 'next/app';
import { useRouter } from "next/navigation";
import "../globals.css"
import { initializeEmojiData } from "@/utils/emojiInit";
import { socket } from "@/config/socket";
import { Inter } from 'next/font/google';
import Head from "next/head";
import SocketProvider from "@/components/SocketProvider";

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
    socket.connect();
    if (user && user.id) {
        socket.emit('setUserOnlineRequest', { userId: user.id, status: 'online' });
    }
  }, [user])

  useEffect(() => {
    const onVisibility = () => {
      if (user &&  user.id) {
        socket.emit('setUserOnlineRequest', {
          userId: user.id,
          status: document.hidden ? 'offline' : 'online',
        });
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      socket.emit('setUserOnlineRequest', { userId: user?.id, status: 'offline' })
      socket.disconnect();
    };
  }, [user, user?.id]);

  const chatRooms = useChatStore((s) => s.chatIds); 

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      </Head>
      <div className={inter.variable}>
        <SocketProvider rooms={chatRooms}/>
        <Component {...pageProps} />
      </div>
    </>
  );
}

export default MyApp;
