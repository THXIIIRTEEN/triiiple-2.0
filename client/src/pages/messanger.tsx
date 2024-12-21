import Protected from "@/components/Protected";
import { getToken } from "@/utils/cookies";
import { useAuthStore } from "@/utils/store";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

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
            {messanger.map((chatRoom: string) => (
                <Link key={chatRoom} href={`messanger/${chatRoom}`}>{chatRoom}</Link>
            ))}
        </Protected>
    );
}

export default Messanger;