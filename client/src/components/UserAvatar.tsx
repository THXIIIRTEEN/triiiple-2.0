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
      const cachedImage = sessionStorage.getItem(`avatar-${id}`);

      if (cachedImage) {
        setImage(cachedImage); 
      } else {
        const handleGetAvatar = async (): Promise<void> => {
          try {
            const response = await axios.post(
              `${process.env.API_URI}/avatar`,
              { userId: id },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (response && response.data.user.profile) {
              const imageUrl = response.data.user.profile;
              const imageResponse = await fetch(imageUrl);
              const imageBlob = await imageResponse.blob();

              const reader = new FileReader();
              reader.onloadend = () => {
                const base64Image = reader.result as string;
                sessionStorage.setItem(`avatar-${id}`, base64Image); 
                setImage(base64Image); 
              };
              reader.readAsDataURL(imageBlob);
            }
          } catch (error) {
            console.error("Error fetching avatar:", error);
            setImage(null);
          }
        };

        handleGetAvatar();
      }
    }

    return () => {
      sessionStorage.removeItem(`avatar-${id}`);
      setImage(null); 
    };
  }, [id, token]);

  return (
    <>
      {image && <Image src={image} alt="profile" width={400} height={400} />}
    </>
  );
};

export default UserAvatar;
