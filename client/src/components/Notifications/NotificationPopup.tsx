import styles from "./notifications.module.scss";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { IMessage } from "@/types/user";
import UserAvatar from "../UserAvatar";
import Username from "../Username";
import { formateDate } from "@/utils/date";
import { useRouter } from "next/router";

interface NotificationPopupProps {
    notification: IMessage;
    setNotificationPopup: Dispatch<SetStateAction<IMessage | null>>;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({notification, setNotificationPopup}) => {
    //@ts-expect-error lol
    const { author, text, date, chatId, isRead, type } = notification;
    const { _id, username, tag } = author || notification;

    const router = useRouter();

    const [dateString, setDateString] = useState<string | null>(type !== 'friend' ? formateDate(date) : null); 
    const [hovered, setHovered] = useState(false);
    
    useEffect(() => { 
        if (type !== 'friend') {
            const dateToString = formateDate(date); 
            setDateString(dateToString);
        }
    }, [date, type]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setNotificationPopup(null);
        }, 10000);

        return () => clearTimeout(timeoutId);
    }, [setNotificationPopup]);

    useEffect(() => {
        const audio = new Audio('/sounds/notification.mp3');
        audio.play().catch((err) => console.error('Ошибка при воспроизведении звука:', err));
    }, []);

    return (
        <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className={`${styles.popup} ${isRead ? styles.isRead : ""} ${hovered ? styles.noOpacity : ''}`} onClick={() => router.push(type !== 'friend' ? `/messanger/${chatId}` : `/profile/${tag}`)}>
            <UserAvatar id={_id}/>
            <div className={styles.text}>
                <div>
                { tag && <Username className={styles.username} username={username} tag={tag}/>}
                { type !== 'friend' && <p>{dateString}</p>}
                <button className={styles.deleteButton} onClick={(e) => {
                    e.stopPropagation(); 
                    setNotificationPopup(null);
                }}>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16 8L8 16M8.00001 8L16 16" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></g></svg>
                </button>
                </div>
                { type !== 'friend' ? <p>{text}</p> : <p>Отправил вам запрос дружбы</p>}
            </div>
        </div>
    );
}

export default NotificationPopup;