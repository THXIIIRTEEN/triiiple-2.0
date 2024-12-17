import AvatarInput from "@/components/AvatarInput";
import UserAvatar from "@/components/UserAvatar";
import { getUserFromCookies } from "@/utils/cookies";
import { useAuthStore } from "@/utils/store";
import { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import axios from "axios";
import { getToken } from "@/utils/cookies";

const ProfilePage: React.FC = () => {

    const user = useAuthStore(state => state.user);
    const [ profile, setProfile ] = useState(user);
    const token = getToken();
    

    useEffect(() => {
        if (!user) {
            setProfile(getUserFromCookies())
        }
    }, [user]);

    console.log(user)

    return (
        <>  
            <AvatarInput user={profile}/>
            {/* <UserAvatar/> */}
            <p>{profile?.id}</p>
            <p>{profile?.username}</p>
            <p>{profile?.email}</p>
            <p>{profile?.tag}</p>
        </>
    )
}

export default ProfilePage;