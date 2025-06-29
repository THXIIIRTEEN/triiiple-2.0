import io from 'socket.io-client';
export const socket = io(`${process.env.API_URI}`, {
    autoConnect: false,
    withCredentials: true,
    transports: ['websocket'],
});