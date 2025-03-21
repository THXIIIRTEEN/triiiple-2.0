import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createNewMessage, deleteMessage, editMessage, setMessageRead, setUserOnline } from '../middlewares/chat';
import multer from 'multer';

let io: SocketIOServer;

const upload = multer({ dest: 'uploads/' });

export const initSocket = (server: HttpServer) => {
    io = new SocketIOServer(server, {
        cors: {
            origin: `${process.env.FRONTEND_URL}`
        },
    });

    io.on('connection', (socket: Socket) => {
        console.log('Пользователь подключился');

        socket.on('joinRoom', (room) => {
            socket.join(room);
            console.log(`Пользователь присоединился к комнате: ${room}`);
        });

        socket.on('sendMessageRequest', async (msg) => {
            const message = await createNewMessage(msg);
            io.to(msg.chatId).emit('addNotReadedMessage', message);
            io.to(msg.chatId).emit('sendMessageResponse', message);
        });

        socket.on('deleteMessageRequest', async (msg) => {
            await deleteMessage(msg);
            io.to(msg.chatId).emit('deleteMessageResponse', msg);
        });
        
        socket.on('editMessageRequest', async (msg) => {
            await editMessage(msg);
            io.to(msg.chatId).emit('editMessageResponse', msg);
        });

        socket.on('readMessageRequest', async (msg) => {
            await setMessageRead(msg);
            msg.isRead = true;
            io.to(msg.chatId).emit('readMessageResponse', msg);
        });

        socket.on('setUserOnlineRequest', async (data) => {
            const user = await setUserOnline(data.userId, data.status);
            io.to(data.userId).emit('setUserOnlineResponse', user);
        });

        socket.on('subscribeToOnlineStatus', ({ userId, friendId }) => {
            socket.join(userId);
            console.log(`Пользователь ${userId} сейчас подписан на ${friendId} онлайн статус`);
        });

        socket.on('disconnect', () => {
            console.log('Пользователь отключился');
        });
    });
};

export const getIO = () => {
    if (!io) {
        throw new Error('Сокет не инициализирован!');
    }
    return io;
};
