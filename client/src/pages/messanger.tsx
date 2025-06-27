import MessangerPreview from "@/components/Messanger/MessangerPreview/MessangerPreview";
import Protected from "@/components/Protected";
import { getToken } from "@/utils/cookies";
import { useAuthStore } from "@/utils/store";
import axios from "axios";
import { useEffect, useState } from "react";
import styles from './styles/messanger.module.scss'
import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";

const Messanger: React.FC = () => {
    const user = useAuthStore(state => state.user);
    const [ messanger, setMessanger ] = useState<string[]>([]);   
    const token = getToken(); 

    useEffect(() => {
        if (user && user.id) {
            const handleGetUserChatRooms = async () => {
                const response = await axios.post(`${process.env.API_URI}/messanger`, {userId: user.id}, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                setMessanger(response.data.user.chatRooms)
            };
            handleGetUserChatRooms();
        }
    }, [user, token]);

    return (
        <Protected>
            <Header/>
            <div className={styles.page}>
                <Sidebar currentPage="messanger"/>
                <div className={styles.previews}>
                    {messanger.map((chatRoom: string) => (
                    <MessangerPreview key={chatRoom} chatId={chatRoom}/>
                    ))}
                </div>
            </div>
        </Protected>
    );
}

export default Messanger;