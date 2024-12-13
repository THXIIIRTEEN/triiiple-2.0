import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/utils/store";
import { getToken } from "@/utils/cookies";

const UserAvatar: React.FC = () => {
    const [image, setImage] = useState<string | null>(null);
    const user = useAuthStore(state => state.user);
    const token = getToken();

    useEffect(() => {
        const handleGetAvatar = async (): Promise<void> => {
            const timestamp = new Date().getTime();
            try {
                const response = await axios.post(`${process.env.API_URI}/avatar`, { userId: user?.id }, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const imageUrlWithTimestamp = `${response.data.user.profile}?${timestamp}`;
                setImage(imageUrlWithTimestamp);
            } catch (error) {
                console.error('Error fetching avatar:', error);
            }
        };
        handleGetAvatar();
    }, [user, token]);

    return (
        <>
            {image &&
                <Image src={image} alt="profile" width={400} height={400} />
            }
        </>
    );
};

export default UserAvatar;
