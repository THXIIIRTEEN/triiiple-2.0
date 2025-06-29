import AvatarInput from "@/components/AvatarInput";
import Protected from "@/components/Protected";
import Sidebar from "@/components/Sidebar/Sidebar";
import UserAvatar from "@/components/UserAvatar";
import { socket } from "@/config/socket";
import { IUser } from "@/types/user";
import { getToken, getUserFromCookies } from "@/utils/cookies";
import { useAuthStore, useChatStore } from "@/utils/store";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "./profile.module.scss"
import Header from "@/components/Header/Header";
import UserOnlineStatus from "@/components/Messanger/UserOnlineStatus/UserOnlineStatus";
import Username from "@/components/Username";
import FriendsList from "@/components/Friends/FriendsList";
import MessageForm from "@/components/Messanger/MessageForm/MessageForm";
import News from "../news";
import Tag from "@/components/Tag";
import Head from "next/head";
import { renderMessageWithEmojis } from "@/components/Messanger/Message";
import { useSocketEvent } from "@/utils/useSocketEvent";

const ProfilePage: React.FC = () => {
    
    const router = useRouter(); 
    const user = useAuthStore(state => state.user);

    const [ profileId, setProfileId ] = useState<string | null>(null);
    const [ profile, setProfile ] = useState<IUser | null>(user?.id === profileId ? user : null); 
    const [ friendStatus, setFriendStatus ] = useState<boolean | "pending">(false);
    const [ hasRequest, setHasRequest ] = useState<boolean>(false);
    const [ showInput, setShowInput ] = useState<boolean>(false);
    const [ showFriends, setShowFriends ] = useState<boolean>(false);
    const [ placeholder, setPlaceholder ] = useState<string>('');
    const [ friendsQuantity, setFriendsQuantity ] = useState<number>(0);
    const [ friendsWord, setfriendsWord ] = useState<string>("друзей");

    const token = getToken();

    useEffect(() => {
        const fetchAboutUser = async () => {
          try {
            if (profileId) {
                const response = await axios.post(`${process.env.API_URI}/fetch-about-user`, {userId: profileId}, { 
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response && response.status === 200) {
                    setPlaceholder(response.data.about_user);
                }
            }
          }
          catch(error) {
            console.log(error)
          }
        }
        fetchAboutUser();
    }, [token, profileId]);

    useEffect(() => {
        const handleGetIdByTag = async () => {
            try {
                const response = await axios.post(`${process.env.API_URI}/get-user-by-id`, { tag: router.query.tag }, { 
                headers: { Authorization: `Bearer ${token}` }, 
                });
                const id = response.data.user._id;
                setProfileId(id);
                
            }
            catch(error) {
                console.error(error)
            }
        }
        handleGetIdByTag();
    }, [router.query.tag, token])

    useEffect(() => {
        if (user && profileId === user.id) {
            setProfile(getUserFromCookies())
        }
        else if (profileId && user) {
            const handleGetProfile = async () => {
                const response = await axios.post(`${process.env.API_URI}/get-user`, {profileId, userId: user?.id}, { 
                    headers: { Authorization: `Bearer ${token}` }, 
                });
                setProfile(response.data.user)
                setFriendStatus(response.data.user?.friendStatus)
            }
            handleGetProfile();
        }
    }, [user, profileId, token, showFriends]);

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
    }, [user, token, profileId, showFriends]);

    const handleAddFriend = () => {
        if (user) { 
            if (profile) {
                socket.emit("addFriendRequest", {
                    userId: user.id,
                    friendId: profileId
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

    useEffect(() => {
        const getFriendWord = (value: number) => {  
            value = Math.abs(value) % 100; 
            const num = value % 10;
            if(value > 10 && value < 20) return "друзей"; 
            if(num > 1 && num < 5) return "друга";
            if(num == 1) return "друг"; 
            return "друзей";
        }
        if (friendsQuantity) {
            const friends = getFriendWord(friendsQuantity);
            setfriendsWord(friends)
        }
    }, [friendsWord, friendsQuantity]);

    const { addChatId } = useChatStore();  

    useEffect(() => {
        if (user && user.id) {
            addChatId([user.id]);
        }
    }, [user, addChatId]);

    const handleAddFriendResponse = (response: {id: string, status: "hasRequest" | "pending" | boolean}) => {
        if (response.id === profileId) {
            if (response.status === "hasRequest") {
                setHasRequest(true);
            } else {
                setFriendStatus(response.status);
            }
        }
    };

    const handleFriendRequestActionResponse = (response: boolean) => {
        setFriendStatus(response);
        setHasRequest(false);
    };

    useSocketEvent('addFriendResponse', async (data) => { 
        handleAddFriendResponse(data)
    });

    useSocketEvent('friendRequestActionResponse', async (data) => { 
        handleFriendRequestActionResponse(data)
    });

    useEffect(() => {
        const handleGetFriendsQuantity = async () => {
            try {
                const response = await axios.post(`${process.env.API_URI}/get-friends-quantity`, {userId: profileId}, { 
                headers: { Authorization: `Bearer ${token}` }, 
                });
                setFriendsQuantity(response.data.friends);
            }
            catch(error) {
                console.error(error)
            }
        }
        handleGetFriendsQuantity();
    }, [profileId, token])

    return (
        <>
        <Head>
            <title>Профиль</title>
            <meta name="description" content="Профиль в triiiple"/>
        </Head>
        <Protected>  
            <Header/>
            <div className={styles.page}>
            <Sidebar currentPage="profile"/>
                <div className={styles.profilePage}>
                
                <div className={styles.topData}>
                    {   user && profileId && profileId === user.id ?
                        <div className={styles.profileBlock}>
                            {   user && profileId === user.id && showInput &&
                            <AvatarInput user={profile} className={styles.avatarInput} onMouseLeave={() => setShowInput(false)}/>
                            }
                            <UserAvatar onMouseEnter={() => setShowInput(true)} id={user?.id} className={styles.profile}/> 
                        </div>
                        :
                        <div className={styles.profileBlock}>
                            {   user && profileId === user.id && showInput &&
                            <AvatarInput user={profile} className={styles.avatarInput} onMouseLeave={() => setShowInput(false)}/>
                            }
                            <UserAvatar onMouseEnter={() => setShowInput(true)} id={profile?._id} className={styles.profile}/>
                        </div>
                    }
                    <div className={styles.userInfo}>
                        {   profile?.tag &&
                            <Username className={styles.title} username={profile?.username} tag={profile?.tag}/>
                        }
                        { profile && profile.tag && <Tag className={styles.tag} tag={profile.tag}/>}
                        {   profileId && user && user.id &&
                            <div className={styles.onlineStatus}>
                                <UserOnlineStatus friendId={profileId} userId={user.id}/>
                            </div>
                        }
                    </div>    
                </div>
                <div className={styles.bottomData}>
                    <div className={styles.aboutUser}>
                        <p className={styles.aboutUserTitle}>Обо мне</p>
                        {   !placeholder ?
                            <p>Здесь пока ничего нет</p> :
                            <p>{renderMessageWithEmojis(placeholder)}</p>
                        }
                    </div>
                    <div className={styles.friends}>
                        <p onClick={() => setShowFriends(true)} className={styles.friendsTitle}>{friendsQuantity? friendsQuantity : 0}</p>
                        <p className={styles.friendsText}>{friendsWord}</p>
                        {   user && profileId !== user.id && friendStatus === false && !hasRequest &&
                            <button className={styles.friendsButton} onClick={handleAddFriend}>Добавить в друзья</button>
                        }
                        {   user && profileId !== user.id && friendStatus === "pending" && !hasRequest &&
                            <button className={styles.friendsButton} onClick={handleAddFriend}>Отменить запрос</button>
                        }
                        {   user && profileId !== user.id && friendStatus === true && !hasRequest &&
                            <button className={styles.friendsButton} onClick={handleAddFriend}>Удалить из друзей</button>
                        }
                        {   user && profileId && user.id !== profileId && hasRequest === true &&
                            <div>
                                <button className={styles.friendsButton} onClick={() => handleRequestAction(true)}>Принять запрос</button>
                                <button className={styles.friendsButton} onClick={() => handleRequestAction(false)}>Отклонить запрос</button>
                            </div>
                        }
                    </div>
                </div>
                { user && profileId === user.id &&
                    <div className={styles.inputNews}>
                        { user && <MessageForm key={"profilePage"} type="send" user={user} page="News" className={styles.messageForm}/>} 
                    </div>
                }
                { profileId && <News page="profile" profileId={profileId}/>}
                {profileId && showFriends &&
                    <div className={styles.overlay}>
                        <FriendsList className={styles.friendsList} profileId={profileId} setShowFriends={setShowFriends}/>
                    </div>
                }
                </div>
            </div>
        </Protected>
        </>
    )
}

export default ProfilePage;