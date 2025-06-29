import { getToken } from "@/utils/cookies";
import axios from "axios";
import { SetStateAction, useEffect, useRef, useState } from "react";
import FriendBlock from "./FriendBlock";
import { IUser } from "@/types/user";
import { Dispatch } from "react";
import styles from './friends.module.scss';
import { useAuthStore, useChatStore } from "@/utils/store";
import { useSocketEvent } from "@/utils/useSocketEvent";

interface FriendsListProps {
    profileId: string;
    className?: string;
    setShowFriends?: Dispatch<SetStateAction<boolean>>; 
    currentPage?: string;
}

const RequestsPage: React.FC<FriendsListProps> = ({ profileId, className, setShowFriends, currentPage }) => {

    const token = getToken(); 
    const user = useAuthStore(state => state.user); 
    const hasMounted = useRef(false); 

    const [ requestsArray, setRequestsArray ] = useState<IUser[] | null>(null);

    const { addChatId } = useChatStore();  

    useEffect(() => {
        if (profileId) {
            addChatId([profileId]);
        }
    }, [profileId, addChatId]);

    useEffect(() => {
        const handleGetFriends = async () => {
            try {
                const response = await axios.post(`${process.env.API_URI}/get-friend-requests`, {userId: profileId}, { 
                headers: { Authorization: `Bearer ${token}` }, 
                });
                setRequestsArray(response.data.requests)
            }
            catch(error) {
                console.error(error)
            }
        }
        handleGetFriends();
    }, [profileId, token]);

    const closeWindows = () => {
        if (!user) {
            return;
        }
        if (setShowFriends) setShowFriends(false)
    }
    useEffect(() => {
        if (hasMounted.current) {
            if (setShowFriends) setShowFriends(false);
        } else {
            hasMounted.current = true;
        }
    }, [profileId, setShowFriends]);

    const handleAddFriendResponse = async (response: {id: string, status: "hasRequest" | "pending" | boolean}) => {
        if (response.id !== profileId && response.status === "hasRequest") {
            const res = await axios.post(`${process.env.API_URI}/get-user-data`, {userId: response.id, requiredData: [`username`, `tag`, `friends`]});
            const user = res.data.user
            setRequestsArray((prev) => [...(prev || []), user])
        }
    };

    useSocketEvent('addFriendResponse', async (msg) => {  
        handleAddFriendResponse(msg)
    });

    return (
        <div className={className}>
            { currentPage !== "friends" &&
            <button className={styles.closeButton} onClick={closeWindows}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16 8L8 16M8.00001 8L16 16" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></g></svg>
            </button>
            }
            {   requestsArray && requestsArray.length > 0 ? requestsArray.map((friends) => {
                return (
                    <FriendBlock key={friends._id} {...friends} setRequestsArray={setRequestsArray}/>
                )
            })
            : <p className={styles.sign}>Здесь пока ничего нет</p>
            } 
        </div>
    )
}

export default RequestsPage;