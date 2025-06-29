import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createNewMessage, deleteMessage, editMessage, setMessageRead, setUserOnline } from '../middlewares/chat';
import multer from 'multer';
import { createNewComment, createNewPost, deleteComment, editComment, editPost, handleAddView, handleLikePost } from '../middlewares/posts';
import { deletePost } from '../middlewares/posts';
import { handleAddFriend, handleEditAboutMe, handleRequestAction } from '../middlewares/users';

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

        socket.on('joinRoom', (data) => {
            const rooms = Array.isArray(data) ? data : [data];
            rooms.forEach(room => {
                socket.join(room);
                console.log(`Пользователь присоединился к комнате: ${room}`);
            });
        });

        socket.on('leaveRoom', (data) => {
            const rooms = Array.isArray(data) ? data : [data];
            rooms.forEach(room => {
                socket.leave(room);
                console.log(`Пользователь ${socket.id} вышел из комнаты: ${room}`);
            });
        });

        socket.on('sendMessageRequest', async (msg) => {
            const message = await createNewMessage(msg);
            io.to(msg.chatId).emit('addNotReadedMessage', message);
            io.to(msg.chatId).emit('sendMessageResponse', message);
        });

        socket.on('sendMessageNewsRequest', async (msg) => {
            const message = await createNewPost(msg);
            io.to(msg.author).emit('sendMessageNewsResponse', message);
        });

        socket.on('deleteMessageRequest', async (msg) => {
            await deleteMessage(msg);
            io.to(msg.chatId).emit('deleteMessageResponse', msg);
        });

        socket.on('deleteMessageNewsRequest', async (msg) => {
            await deletePost(msg);
            io.to(msg.userId).emit('deleteMessageNewsResponse', msg);
        });

        socket.on('deleteCommentNewsRequest', async (msg) => {
            await deleteComment(msg);
            io.to(msg.postId).emit('deleteCommentNewsResponse', msg);
        });
        
        socket.on('editMessageRequest', async (msg) => {
            await editMessage(msg);
            io.to(msg.chatId).emit('editMessageResponse', msg);
        });

        socket.on('editMessageNewsRequest', async (msg) => {
            await editPost(msg);
            io.to(msg.userId).emit('editMessageNewsResponse', msg);
        });

        socket.on('editMessageCommentRequest', async (msg) => {
            await editComment(msg);
            io.to(msg.postId).emit('editMessageCommentResponse', msg);
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

        socket.on('addFriendRequest', async (data) => {
            const response = await handleAddFriend(data);
            io.to(data.userId).emit('addFriendResponse', {
                id: data.friendId,
                status: response
            });
            io.to(data.friendId).emit('addFriendResponse', {
                id: data.userId,
                status: response === "pending" ? "hasRequest" : response
            });
        });

        socket.on('friendRequestActionRequest', async (data) => {
            const response = await handleRequestAction(data);
            const rooms = [data.userId, data.friendId];
            io.to(rooms).emit('friendRequestActionResponse', {id: data.friendId, userId: data.userId, status: response});
        });

        socket.on('subscribeToOnlineStatus', ({ userId, friendId }) => {
            socket.join(userId);
            console.log(`Пользователь ${userId} сейчас подписан на ${friendId} онлайн статус`);
        });
        
        socket.on('likePostNewsRequest', async (data) => {
            const postData = await handleLikePost(data.postId, data.userId);
            io.to(data.postId).emit('likePostNewsResponse', postData);
        });

        socket.on('addViewPostNewsRequest', async (data) => {
            const postData = await handleAddView(data.postId, data.userId);
            io.to(data.postId).emit('addViewPostNewsResponse', postData);
        });

        socket.on('sendMessageCommentRequest', async (msg) => {
            const message = await createNewComment(msg);
            io.to(msg.author).emit('sendMessageCommentResponse', message);
        });

        socket.on('sendMessageAboutUserRequest', async (data) => {
            const user = await handleEditAboutMe(data);
            io.to(`edit-about-me-${data.author}`).emit('sendMessageAboutUserResponse', user);
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
