import AvatarInput from "@/components/AvatarInput";
import Protected from "@/components/Protected";
import UserAvatar from "@/components/UserAvatar";
import { socket } from "@/config/socket";
import { IUser } from "@/types/user";
import { getToken, getUserFromCookies, removeToken } from "@/utils/cookies";
import { useAuthStore } from "@/utils/store";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const ProfilePage: React.FC = () => {
    const router = useRouter(); 
    const user = useAuthStore(state => state.user);
    const profileId = router.query.id;
    const [ profile, setProfile ] = useState<IUser | null>(user?.id === profileId ? user : null); 
    const [ friendStatus, setFriendStatus ] = useState<boolean | "pending">(false);
    const [ hasRequest, setHasRequest ] = useState<boolean>(false);
    const logout = useAuthStore().logout;
    const token = getToken();

    useEffect(() => {
        if (profileId === user?.id) {
            if (!user) {
                setProfile(getUserFromCookies())
            }
        }
        else if (profileId && user) {
            const handleGetProfile = async () => {
                const response = await axios.post(`${process.env.API_URI}/get-user`, {profileId, userId: user?.id}, { 
                    headers: { Authorization: `Bearer ${token}` }, 
                });
                console.log(response)
                setProfile(response.data.user)
                setFriendStatus(response.data.user?.friendStatus)
            }
            handleGetProfile();
        }
    }, [user, profileId, token]);

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

    const handleLogout = () => {
        logout();
        removeToken();
        window.location.reload();
    }

    useEffect(() => {
        if (user) {
            socket.connect();
            socket.emit('joinRoom', user.id);
        }
    }, [user])

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
        socket.on('addFriendResponse', (response) => {
            if (response === "hasRequest") {
                setHasRequest(true)
            }
            else {
                setFriendStatus(response);
            }
        });

        return () => {
            if (user && user.id) {
                socket.emit('leaveRoom', user.id);
            }
            socket.off('addFriendResponse');
            socket.disconnect();
        };
    }, [user]);

    useEffect(() => {
        socket.on('friendRequestActionResponse', (response) => {
            setFriendStatus(response);
            setHasRequest(false)
        });

        return () => {
            if (user && user.id) {
                socket.emit('leaveRoom', user.id);
            }
            socket.off('friendRequestActionResponse');
            socket.disconnect();
        };
    }, [user]);

    return (
        <Protected>  
            {   user && profileId === user.id &&
                <AvatarInput user={profile}/>
            }
            {   user && profileId && profileId === user.id ?
                <UserAvatar id={user?.id}/> :
                <UserAvatar id={profile?._id}/>
            }
            <p>{profile?._id}</p>
            <p>{profile?.username}</p>
            <p>{profile?.email}</p>
            <p>{profile?.tag}</p>
            {   user && profileId !== user.id && friendStatus === false && !hasRequest &&
                <button onClick={handleAddFriend}>Add Friend</button>
            }
            {   user && profileId !== user.id && friendStatus === "pending" && !hasRequest &&
                <button onClick={handleAddFriend}>Cancel request</button>
            }
            {   user && profileId !== user.id && friendStatus === true && !hasRequest &&
                <button onClick={handleAddFriend}>Delete friend</button>
            }
            {   user && profileId && hasRequest === true &&
                <div>
                    <button onClick={() => handleRequestAction(true)}>Accept</button>
                    <button onClick={() => handleRequestAction(false)}>Decline</button>
                </div>
            }
            {   user && profileId === user.id &&
                <button onClick={handleLogout}>Logout</button>
            }
        </Protected>
    )
}

export default ProfilePage;