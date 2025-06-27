import { useState, useEffect, Dispatch, SetStateAction } from "react";
import UserAvatar from "../UserAvatar";
import styles from './friends.module.scss'
import { useAuthStore } from "@/utils/store";
import { socket } from "@/config/socket";
import { IUser } from "@/types/user";
import { getToken, getUserFromCookies } from "@/utils/cookies";
import axios from "axios";
import Username from "../Username";
import Link from "next/link";
import { useRouter } from "next/router";

interface FriendBlockProps {
  _id?: string;
  tag?: string;
  username?: string;
  setFriendsArray?: Dispatch<SetStateAction<IUser[] | null>>; 
  setRequestsArray?: Dispatch<SetStateAction<IUser[] | null>>; 
}

const FriendBlock: React.FC<FriendBlockProps> = ({_id, tag, username, setFriendsArray, setRequestsArray} ) => {
    const user = useAuthStore(state => state.user); 
    const token = getToken();  
    const profileId = _id;
    const [ friendStatus, setFriendStatus ] = useState<boolean | "pending">(false); 
    const [ hasRequest, setHasRequest ] = useState<boolean>(false);
    const [ profile, setProfile ] = useState<IUser | null>(user?.id === profileId ? user : null);

    useEffect(() => {
        if (user && profileId === user.id) {
            setProfile(getUserFromCookies())
        }
        else if (profileId && user) {
            const handleGetProfile = async () => {
                const response = await axios.post(`${process.env.API_URI}/get-user`, {profileId: profileId, userId: user.id}, { 
                    headers: { Authorization: `Bearer ${token}` }, 
                });
                setProfile(response.data.user)
                setFriendStatus(response.data.user?.friendStatus)
            }
            handleGetProfile();
        }
    }, [user, token, profileId]);

    useEffect(() => {
        const handleGetUserRequests = async () => {
            const response = await axios.post(`${process.env.API_URI}/get-request`, {userId: user?.id, profileId}, { 
                headers: { Authorization: `Bearer ${token}` }, 
            });
            setHasRequest(response.data.hasRequest)
        }
        if (user && profileId) {
            handleGetUserRequests();
        }
    }, [user, token, profileId]);

    const handleAddFriend = () => { 
        if (user) { 
            if (_id) {
                socket.emit("addFriendRequest", {
                    userId: user.id,
                    friendId: _id
                });
            }
        }
    }
    const handleRequestAction = (action: boolean) => {
        if (user) { 
            if (profile) {
                socket.emit("friendRequestActionRequest", {
                    userId: user.id,
                    friendId: profileId,
                    action
                });
            }
        }
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(`${process.env.FRONTEND_URL}/profile/${tag}`);
            alert("Ссылка на страницу пользователя скопирована");
        } catch (err) {
            alert(err);
        }
    };

    useEffect(() => {
        if (!user) return;

        socket.connect();
        socket.emit('joinRoom', profileId);

        const handleAddFriendResponse = (response: {id: string, status: "hasRequest" | "pending" | boolean}) => {
            if (response.id === profileId) {
                if (response.status === "hasRequest") {
                    setHasRequest(true);
                } else {
                    setFriendStatus(response.status);
                }
            }
        };

        const handleFriendRequestActionResponse = (response: {id: string, status: "pending" | boolean}) => {
            if (response.id === profileId) {
                setFriendStatus(response.status);
                setHasRequest(false);
            }
        };

        socket.on('addFriendResponse', handleAddFriendResponse);
        socket.on('friendRequestActionResponse', handleFriendRequestActionResponse);

        return () => {
            if (user && user.id) {
                socket.emit('leaveRoom', profileId);
            }
            socket.off('addFriendResponse', handleAddFriendResponse);
            socket.off('friendRequestActionResponse', handleFriendRequestActionResponse);
        };
    }, [user, profileId]);

    const router = useRouter(); 

    const handleRedirectToChat = async () => {
        const response = await axios.post(`${process.env.API_URI}/create-chat`, { members: [user?.id, profileId]}, { 
            headers: { Authorization: `Bearer ${token}` }, 
        });

        const id = response.data.message;
        router.push(`/messanger/${id}`)
    }

    const handleDeleteFriend = () => {
        if (setFriendsArray) {
            setFriendsArray((prev) => prev!.filter((friend) => friend._id !== _id))
        }
    };

    const handleDeleteRequest = () => {
        if (setRequestsArray) {
            setRequestsArray((prev) => prev!.filter((request) => request._id !== _id))
        }
    };

    return (
        <div className={styles.block}>  
            <div className={styles.profileBlock}>
                <UserAvatar id={_id} className={styles.profile}/>
                <Link href={`/profile/${tag}`} className={styles.profileLink}></Link>
            </div>
            <div className={styles.userInfo}>
                <div>
                    { tag &&
                        <Username className={styles.username} username={username} tag={tag}/>
                    }
                    <p onClick={handleCopy} className={styles.tag}>{`@${tag}`}</p>
                </div>
                {   user && profileId && user.id !== profileId && !hasRequest &&
                    <div className={styles.buttons}>
                    {   user && profileId !== user.id && friendStatus === true &&
                        <button className={styles.friendsButton} onClick={handleRedirectToChat}>Написать</button>
                    }
                    {   user && profileId !== user.id && friendStatus === false && !hasRequest &&
                        <button className={styles.friendsButton} onClick={handleAddFriend}>Добавить в друзья</button>
                    }
                    {   user && profileId !== user.id && friendStatus === "pending" && !hasRequest &&
                        <button className={styles.friendsButton} onClick={handleAddFriend}>Отменить запрос</button>
                    }
                    {   user && profileId !== user.id && friendStatus === true && !hasRequest &&
                        <button className={styles.friendsButton} onClick={() => {handleAddFriend(); if (setFriendsArray) handleDeleteFriend();}}>Удалить из друзей</button>
                    }
                    </div>
                }
                {   user && profileId && user.id !== profileId && hasRequest === true &&
                    <div className={styles.buttons}>
                        <button className={styles.friendsButton} onClick={() => {handleRequestAction(true); if (setRequestsArray) handleDeleteRequest();}}>Принять запрос</button>
                        <button className={styles.friendsButton} onClick={() => {handleRequestAction(false); if (setRequestsArray) handleDeleteRequest();}}>Отклонить запрос</button>
                    </div>
                }
            </div>
        </div>
    )
}

export default FriendBlock;