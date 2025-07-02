'use client';

import { useEffect } from 'react';
import { socket } from '@/config/socket';
import { useSocketListenersStore } from '@/utils/store';

interface ISocketProviderProps {
    rooms: string[] | string;
}

const SocketProvider: React.FC<ISocketProviderProps> = ({rooms}) => {
    const emitToListeners = useSocketListenersStore((s) => s.emitToListeners);
    const socketEvents = [
        'sendMessageResponse',
        'sendMessageWithFilesResponse',
        'createChatRoomResponse',
        'addFriendResponse',
        'friendRequestActionResponse',
        'readMessageResponse',
        'editMessageResponse',
        'deleteMessageResponse',
        'sendMessageAboutUserResponse',
        'setUserOnlineResponse',
        'addNotReadedMessage',
        'sendMessageNewsResponse',
        'sendPostWithFilesResponse',
        'deleteMessageNewsResponse',
        'editMessageNewsResponse',
        'readNotificationResponse',
        'deleteNotificationResponse'
    ];

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleAny = (event: string, data: any) => {
            emitToListeners(event, data);
        };
        socket.connect();
        socket.emit('joinRoom', rooms);
        socketEvents.forEach((event) => {
            socket.on(event, (data) => {
                handleAny(event, data)
            });
        });

        return () => {
            socketEvents.forEach((event) => {
                socket.off(event);
            });
            socket.emit('leaveRoom', rooms);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [emitToListeners, rooms]);

    return null;
};

export default SocketProvider;