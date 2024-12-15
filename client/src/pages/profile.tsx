import AvatarInput from "@/components/AvatarInput";
import UserAvatar from "@/components/UserAvatar";
import { getUserFromCookies, saveToken } from "@/utils/cookies";
import { useAuthStore } from "@/utils/store";
import { useEffect, useState } from "react";
import { useCookies } from 'react-cookie';

const ProfilePage: React.FC = () => {

    const user = useAuthStore(state => state.user);
    const [ profile, setProfile ] = useState(user)

    useEffect(() => {
        if (!user) {
            setProfile(getUserFromCookies())
        }
    }, [user]);

    const [cookies] = useCookies(['jwtToken']);

    console.log(cookies)

    useEffect(() => {
        const token = cookies.jwtToken;
        if (token) {
            saveToken(token);
        }
    }, [cookies]);

    return (
        <>  
            <AvatarInput user={profile}/>
            <UserAvatar/>
            <p>{profile?.id}</p>
            <p>{profile?.username}</p>
            <p>{profile?.email}</p>
            <p>{profile?.tag}</p>
        </>
    )
}

export default ProfilePage;