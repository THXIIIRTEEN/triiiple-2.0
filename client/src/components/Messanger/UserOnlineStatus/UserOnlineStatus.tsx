import { socket } from "@/config/socket";
import { formateDate } from "@/utils/date";
import axios from "axios";
import { useEffect, useState } from "react";

interface UserOnlineStatusProps {
    friendId: string;
    userId: string;
}

const UserOnlineStatus: React.FC<UserOnlineStatusProps> = ({friendId, userId}) => {
    const [ onlineStatus, setOnlineStatus ] = useState<boolean>(false);
  
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
    }, [friendId]);

    useEffect(() => {
        socket.on('setUserOnlineResponse', (user) => {
            setOnlineStatus(user.onlineStatus);
        });

        return () => {
            socket.off('setUserOnlineResponse');
            socket.disconnect();
        };
    }, []);

    return (
        <>
            <p>{typeof onlineStatus !== 'boolean' ? `Был в сети ${formateDate(onlineStatus)}` : "Онлайн"}</p>
        </>
    )
}

export default UserOnlineStatus;