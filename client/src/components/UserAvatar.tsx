import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getToken } from "@/utils/cookies";

interface UserAvatarProps {
    id: string | undefined;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ id }) => {
    const [image, setImage] = useState<string | null>(null);
    const token = getToken();

    useEffect(() => {
        if (id) {
            const handleGetAvatar = async (): Promise<void> => {
                const timestamp = new Date().getTime();

                try {
                    const response = await axios.post(`${process.env.API_URI}/avatar`, { userId: id }, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    const imageUrl = response.data.user.profile
                    try {
                        const parsedUrl = new URL(imageUrl);
                        if (parsedUrl.hostname === "sun1-97.userapi.com") { //приходится фиксить косяки за VK
                            const cleanUrl = imageUrl.split('?')[0];
                            const imageUrlWithTimestamp = `${cleanUrl}?quality=95&crop=12,100,682,682&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640&ava=1&t=${timestamp}`;
                            setImage(imageUrlWithTimestamp);
                        } else {
                            const imageUrlWithTimestamp = `${imageUrl}?${timestamp}`;
                            setImage(imageUrlWithTimestamp);
                        }
                    } catch (error) {
                        console.error("Invalid URL:", error);
                    }
                } catch (error) {
                    console.error('Error fetching avatar:', error);
                    setImage(null);
                }
            };

            handleGetAvatar();
        }
    }, [id, token]);
    
    return (
        <>
            {image &&
                <Image src={image} alt="profile" width={400} height={400} />
            }
        </>
    );
};

export default UserAvatar;
