import { IMessage } from "@/types/user";
import { formateDate } from "@/utils/date";
import { useEffect, useState, Dispatch, SetStateAction, useRef } from "react";
import Username from "../Username";
import UserAvatar from "../UserAvatar";
import styles from "./notifications.module.scss";
import { useRouter } from "next/router";
import { openDB } from 'idb';

interface NotificationProps {
    notification: IMessage;
    setNotificationsArray: Dispatch<SetStateAction<IMessage[]>>;
}

const Notification: React.FC<NotificationProps> = ({notification, setNotificationsArray}) => {
    //@ts-expect-error lol
    const { author, text, date, chatId, isRead, type } = notification;
    const { _id, username, tag } = author || notification;
    const [dateString, setDateString] = useState<string | null>(type !== 'friend' ? formateDate(date) : null); 
    
    const router = useRouter();

    useEffect(() => {
        if (type !== 'friend') {
            const dateToString = formateDate(date); 
            setDateString(dateToString);
        }
    }, [date, type]);

    const deleteNotification = async (id: string) => {
        const db = await openDB('app-db', 1);
        await db.delete('notifications', id);
    };

    const handleDeleteNotification = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setNotificationsArray((prev: IMessage[]) => {return prev.filter((msg) => msg._id !== notification._id)})
        await deleteNotification(notification._id);
    }

    const ref = useRef<HTMLDivElement>(null); 

    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry.isIntersecting && !notification.isRead) {
                    timeoutId = setTimeout(async () => {
                        try {
                            const db = await openDB('app-db', 1);
                            await db.put('notifications', {
                                ...notification,
                                id: notification._id,
                                isRead: true,
                            });

                            setNotificationsArray((prev) =>
                                prev.map((msg) =>
                                    msg._id === notification._id
                                        ? { ...msg, isRead: true }
                                        : msg
                                )
                            );
                        } catch (err) {
                            console.error('Ошибка при пометке как прочитанного:', err);
                        }
                    }, 1000);

                    observer.disconnect();
                }
            },
            { threshold: 0.5 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            observer.disconnect();
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [notification, setNotificationsArray, ref]);


    return (
        <div ref={ref} className={`${styles.notification} ${isRead ? styles.isRead : ""}`} onClick={() => router.push(type !== 'friend' ? `/messanger/${chatId}` : `/profile/${tag}`)}>
            <UserAvatar id={_id}/>
            <div className={styles.text}>
                <div>
                { tag && <Username className={styles.username} username={username} tag={tag}/>}
                { type !== 'friend' && <p>{dateString}</p>}
                <button className={styles.deleteButton} onClick={(e) => handleDeleteNotification(e)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none">
                      <path d="M4 6H20L18.4199 20.2209C18.3074 21.2337 17.4512 22 16.4321 22H7.56786C6.54876 22 5.69264 21.2337 5.5801 20.2209L4 6Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M7.34491 3.14716C7.67506 2.44685 8.37973 2 9.15396 2H14.846C15.6203 2 16.3249 2.44685 16.6551 3.14716L18 6H6L7.34491 3.14716Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M2 6H22" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M10 11V16" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M14 11V16" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                </div>
                { type !== 'friend' ? <p>{text}</p> : <p>Отправил вам запрос дружбы</p>}
            </div>
        </div>
    );
}

export default Notification;