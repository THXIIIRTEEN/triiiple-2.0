import { socket } from "@/config/socket";
import { formateDate } from "@/utils/date";
import { useChatStore } from "@/utils/store";
import { useSocketEvent } from "@/utils/useSocketEvent";
import axios from "axios";
import { useEffect, useState } from "react";

interface UserOnlineStatusProps {
    friendId: string;
    userId: string;
}

const UserOnlineStatus: React.FC<UserOnlineStatusProps> = ({friendId, userId}) => {
    const [ onlineStatus, setOnlineStatus ] = useState<boolean>(false);
    const { addChatId } = useChatStore();  
    
    useEffect(() => {
        if (friendId && userId) {
            addChatId([friendId, userId]);
        }
    }, [friendId, addChatId, userId]);
  
    useEffect(() => {
        const getOnlineStatus = async () => {
            if (friendId) {
                const response = await axios.post(`${process.env.API_URI}/get-online-status`, {userId: friendId});
                setOnlineStatus(response.data.user.onlineStatus);
            }
        }
        getOnlineStatus();
    }, [friendId, userId]);

    useEffect(() => {
        const subscribeToOnlineStatus = async () => {
            if (friendId) { 
                socket.emit("subscribeToOnlineStatus", { 
                    userId: friendId,
                });
            }
        }
        subscribeToOnlineStatus();
        return () => {
            socket.emit('leaveRoom', friendId)
        }
    }, [friendId]);

    useSocketEvent('setUserOnlineResponse', (user) => { 
        setOnlineStatus(user.onlineStatus);
    });

    return (
        <>
            <p>{typeof onlineStatus !== 'boolean' ? `Был в сети ${formateDate(onlineStatus)}` : "Онлайн"}</p>
        </>
    )
}

export default UserOnlineStatus;