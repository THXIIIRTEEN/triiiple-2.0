import { useEffect, useState } from "react";
import styles from "./notifications.module.scss";
import { IMessage } from "@/types/user";
import axios from "axios";
import { useAuthStore, useChatStore } from "@/utils/store";
import Notification from "./Notification";
import NotificationPopup from "./NotificationPopup";
import { useSocketEvent } from "@/utils/useSocketEvent";

const Notifications: React.FC = () => {

    const [ showList, setShowList ] = useState<boolean>(false);
    const [ notificationsArray, setNotificationsArray ] = useState<IMessage[]>([]);
    const [ chatRooms, setChatRooms ] = useState<string[]>([]);
    const [ notificationPopup, setNotificationPopup ] = useState<IMessage | null>(null)

    const user = useAuthStore().user;

    const { addChatId } = useChatStore();  

    useEffect(() => {
        if (chatRooms.length > 0 && user && user.id) {
            addChatId([...chatRooms, user.id]);
        }
    }, [chatRooms, addChatId, user]);

    useEffect(() => {
        const handleGetNotifications = async () => {
            if (user && user.id) {
                const res = await axios.post(`${process.env.API_URI}/get-notifications`, {userId: user.id});
                setNotificationsArray(res.data.notifications);
            }
        };
        handleGetNotifications();
    }, [user, user?.id]);

    useEffect(() => {
        const handleGetChatRooms = async () => {
            if (user && user.id) {
                const res = await axios.post(`${process.env.API_URI}/get-user-data`, {userId: user.id, requiredData: [`chatRooms`]}); 
                const newRooms = res.data.user.chatRooms || [];
                const updatedRooms = new Set([...newRooms, user.id]);

                setChatRooms(Array.from(updatedRooms));
            }
        }
        handleGetChatRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const addMessageNotification = async (msg: IMessage) => {
        setNotificationsArray((prevMessages) => [...prevMessages, msg]);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleAddFriendResponse = async (response: {id: string, status: "hasRequest" | "pending" | boolean, notification: any}) => {
        if (user && response.id !== user.id && response.status === "hasRequest") {
            setNotificationsArray((prev) => [...prev, response.notification]);
            setNotificationPopup(response.notification);
        }
    };

    useSocketEvent('sendMessageResponse', async (msg) => {
        if (user && msg.author._id !== user.id) {
            addMessageNotification(msg.notification);
            setNotificationPopup(msg.notification);
        }
    });

    useSocketEvent('sendMessageWithFilesResponse', async (msg) => {
        if (user && msg.author._id !== user.id) {
            addMessageNotification(msg.notification);
            setNotificationPopup(msg.notification);
        }
    });
    
    useSocketEvent('createChatRoomResponse', async (id: string) => {
        setChatRooms((prev) => [...prev, id]);
    });

    useSocketEvent('addFriendResponse', async (response) => {
        if (response.notification) {
            handleAddFriendResponse(response)
        }
    });

    return (
        <>
            <div className={styles.buttonBlock}>
                <button className={styles.button} onClick={() => setShowList(!showList)}>
                    { !showList ?
                        <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.54184 14.2222H3.1918C1.95025 14.2222 1.32948 14.2222 1.19886 14.1299C1.05213 14.0262 1.01627 13.965 1.00038 13.7912C0.986242 13.6364 1.36671 13.0403 2.12766 11.8485C2.91333 10.6177 3.58046 8.82586 3.58046 6.28889C3.58046 4.88619 4.20412 3.54094 5.31424 2.54908C6.42437 1.55722 7.93002 1 9.49998 1C11.0699 1 12.5756 1.55722 13.6857 2.54908C14.7959 3.54094 15.4195 4.88619 15.4195 6.28889C15.4195 8.82586 16.0866 10.6177 16.8723 11.8485C17.6332 13.0403 18.0137 13.6364 17.9996 13.7912C17.9837 13.965 17.9478 14.0262 17.8011 14.1299C17.6705 14.2222 17.0497 14.2222 15.8082 14.2222H12.4597M6.54184 14.2222L6.54023 15.1667C6.54023 16.7315 7.8654 18 9.49998 18C11.1347 18 12.4597 16.7315 12.4597 15.1667V14.2222M6.54184 14.2222H12.4597" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        :
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16 8L8 16M8.00001 8L16 16" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></g></svg>
                    }
                    {   notificationsArray.filter((msg) => {return msg && msg.isRead !== true}).length > 0 &&
                        <div className={styles.marker}></div>
                    }
                </button>

                { showList &&
                    <div className={styles.notificationsList}>
                        {notificationsArray.length > 0 ? (
                            [...notificationsArray]
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .map((notification) => (
                                    <Notification
                                        key={notification._id}
                                        setNotificationsArray={setNotificationsArray}
                                        notification={notification}
                                    />
                                ))
                        ) : (
                            <p className={styles.nothing}>Здесь пока ничего нет</p>
                        )}
                    </div>
                }
            </div>
            { notificationPopup && <NotificationPopup notification={notificationPopup} setNotificationPopup={setNotificationPopup}/>}
        </>
    );
}

export default Notifications;