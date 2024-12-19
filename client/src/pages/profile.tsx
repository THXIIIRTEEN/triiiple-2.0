import AvatarInput from "@/components/AvatarInput";
import Protected from "@/components/Protected";
import UserAvatar from "@/components/UserAvatar";
import { getUserFromCookies } from "@/utils/cookies";
import { useAuthStore } from "@/utils/store";
import { useEffect, useState } from "react";

const ProfilePage: React.FC = () => {

    const user = useAuthStore(state => state.user);
    const [ profile, setProfile ] = useState(user);    

    useEffect(() => {
        if (!user) {
            setProfile(getUserFromCookies())
        }
    }, [user]);

    return (
        <Protected>  
            <AvatarInput user={profile}/>
            <UserAvatar/>
            <p>{profile?.id}</p>
            <p>{profile?.username}</p>
            <p>{profile?.email}</p>
            <p>{profile?.tag}</p>
        </Protected>
    )
}

export default ProfilePage;