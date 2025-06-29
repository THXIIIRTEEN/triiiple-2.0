import { getToken } from '@/utils/cookies';
import { jwtDecode } from 'jwt-decode';
import io from 'socket.io-client';

const token = getToken(); 
const userId = token ? jwtDecode<{ id: string }>(token).id : undefined; 

export const socket = io(`${process.env.API_URI}`, {
    autoConnect: false,
    withCredentials: true,
    transports: ['websocket'],
    auth: {
        userId,
    },
});