import AvatarInput from "@/components/AvatarInput";
import Protected from "@/components/Protected";
import UserAvatar from "@/components/UserAvatar";
import { getUserFromCookies, removeToken } from "@/utils/cookies";
import { useAuthStore } from "@/utils/store";
import { useEffect, useState } from "react";

const ProfilePage: React.FC = () => {

    const user = useAuthStore(state => state.user);
    const [ profile, setProfile ] = useState(user);  
    const logout = useAuthStore().logout;
  

    useEffect(() => {
        if (!user) {
            setProfile(getUserFromCookies())
        }
    }, [user]);

    const handleLogout = () => {
        logout();
        removeToken();
        window.location.reload();
    }

    return (
        <Protected>  
            <AvatarInput user={profile}/>
            <UserAvatar id={profile?.id}/>
            <p>{profile?.id}</p>
            <p>{profile?.username}</p>
            <p>{profile?.email}</p>
            <p>{profile?.tag}</p>
            <button onClick={handleLogout}>Logout</button>
        </Protected>
    )
}

export default ProfilePage;