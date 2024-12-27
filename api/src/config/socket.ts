import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createNewMessage, deleteMessage, editMessage } from '../middlewares/chat';

let io: SocketIOServer;

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

        socket.on('sendMessageAndFilesRequest', async (msg) => {
            console.log(msg)
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
