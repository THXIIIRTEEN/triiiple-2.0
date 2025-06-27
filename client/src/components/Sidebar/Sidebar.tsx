import Logo from "@/assets/Logo.svg"
import UserAvatar from "../UserAvatar";
import { useAuthStore } from "@/utils/store";
import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./sidebar.module.scss"
import Tag from "../Tag";
import { useRouter } from "next/router";
import MessangerPreview from "../Messanger/MessangerPreview/MessangerPreview";
import { getToken } from "@/utils/cookies";
import axios from "axios";
import Username from "../Username";

interface ISidebarProps {
    currentPage: string;
}

const Sidebar: React.FC<ISidebarProps> = ({currentPage}) => {
    const router = useRouter();
    const { pathname, query } = router; 
        
    const token = getToken(); 

    const { user } = useAuthStore();
    const [ showSidebar, setShowSidebar ] = useState(false);
    const [ messanger, setMessanger ] = useState<string[]>([]);   
    const [ currentMode, setCurrentMode ] = useState<string>(pathname.startsWith("/messanger/") && typeof query.id === "string" ? "messanger" : "default" );

    useEffect(() => {
        if (pathname.startsWith("/messanger/") && typeof query.id === "string") {
            setCurrentMode("messanger")
        }
    }, [setCurrentMode, pathname, query.id])

    useEffect(() => {
        if (user && user.id) {
            const handleGetUserChatRooms = async () => {
                const response = await axios.post(`${process.env.API_URI}/messanger`, {userId: user.id}, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                setMessanger(response.data.user.chatRooms)
            };
            handleGetUserChatRooms();
        }
    }, [user, token]); 

    return (
        <>
            { user && showSidebar === true && currentMode === "default" &&
            <div className={styles.sidebar}>
                <div className={styles.top}>
                    { showSidebar === true && pathname.startsWith("/messanger/") && typeof query.id === "string" &&
                        <button className={`${styles.closeButton} ${styles.burgerButton}`} onClick={() => setCurrentMode("messanger")}>
                            <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4.5 20.25H22.5" stroke="black" stroke-width="2" stroke-linecap="round"/>
                                <path d="M4.5 13.5H22.5" stroke="black" stroke-width="2" stroke-linecap="round"/>
                                <path d="M4.5 6.75H22.5" stroke="black" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </button>
                    }
                    <Logo className={styles.logo}></Logo>
                    { showSidebar === true &&
                        <button className={styles.closeButton} onClick={() => setShowSidebar(false)}>
                            <svg className={styles.closeIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16 8L8 16M8.00001 8L16 16" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></g></svg>
                        </button>
                    }
                </div>
                <UserAvatar id={user.id} className={styles.avatar}/>
                { user.tag && <Username className={styles.username} username={user.username} tag={user.tag}/>}
                {user && user.tag && <Tag className={styles.tag} tag={user.tag}/>}

                <ul className={styles.list}>
                    <li className={`${styles.linkBackground} ${currentPage === "profile" && styles.currentPage}`}>
                        <Link href={`/profile/${user.tag}`}>
                            <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M14.0782 15.3H2.92245C2.32202 15.3 1.87863 14.7075 2.10509 14.1627C3.15585 11.6433 5.62439 10.2 8.49987 10.2C11.3762 10.2 13.8448 11.6433 14.8955 14.1627C15.122 14.7075 14.6786 15.3 14.0782 15.3ZM5.02917 5.09999C5.02917 3.22489 6.58665 1.69999 8.49987 1.69999C10.414 1.69999 11.9706 3.22489 11.9706 5.09999C11.9706 6.97509 10.414 8.49999 8.49987 8.49999C6.58665 8.49999 5.02917 6.97509 5.02917 5.09999ZM16.9623 14.9906C16.3315 12.1354 14.3584 10.0283 11.7615 9.07202C13.1376 7.98657 13.9402 6.2313 13.6452 4.30944C13.3033 2.07989 11.4101 0.295781 9.1246 0.0356804C5.96973 -0.32387 3.29381 2.08164 3.29381 5.09999C3.29381 6.70649 4.0539 8.13787 5.23914 9.07202C2.64132 10.0283 0.669089 12.1354 0.0374204 14.9906C-0.191646 16.0284 0.662149 17 1.74588 17H15.2539C16.3385 17 17.1923 16.0284 16.9623 14.9906Z" fill="black"/>
                            </svg>
                            Моя страница
                        </Link>
                    </li>
                    <li className={`${styles.linkBackground} ${currentPage === "news" && styles.currentPage}`}>
                        <Link href={"/news"}>
                            <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12.2778 0C13.2736 0 14.0894 0.729995 14.1615 1.65592L14.1667 1.78947V6.26316H15.5833C16.3197 6.26316 16.9249 6.79545 16.9935 7.47601L17 7.60526V14.3158C17 15.7453 15.8205 16.9138 14.3331 16.9954L14.1667 17H1.88889C0.893102 17 0.0772885 16.27 0.00518101 15.3441L0 15.2105V1.78947C0 0.846097 0.770551 0.0732207 1.74792 0.00490832L1.88889 0H12.2778ZM15.1111 8.05263H14.1667V15.2105C14.6883 15.2105 15.1111 14.81 15.1111 14.3158V8.05263ZM12.2778 1.78947H1.88889V15.2105H12.2778V1.78947ZM7.55556 8.94737C8.07717 8.94737 8.5 9.34794 8.5 9.8421C8.5 10.301 8.13542 10.6791 7.6657 10.7308L7.55556 10.7368H4.72222C4.20062 10.7368 3.77778 10.3363 3.77778 9.8421C3.77778 9.38324 4.14237 9.00507 4.61208 8.95339L4.72222 8.94737H7.55556ZM9.44444 4.47368C9.96606 4.47368 10.3889 4.87428 10.3889 5.36842C10.3889 5.86257 9.96606 6.26316 9.44444 6.26316H4.72222C4.20062 6.26316 3.77778 5.86257 3.77778 5.36842C3.77778 4.87428 4.20062 4.47368 4.72222 4.47368H9.44444Z" fill="black"/>
                            </svg>
                            Новости
                        </Link>
                    </li>
                    <li className={`${styles.linkBackground} ${currentPage === "messanger" && styles.currentPage} ${currentPage === "messanger" && styles.currentPageMessanger}`}>
                        <Link href={"/messanger"}>
                            <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4.77778 6.3125H14.2222M4.77778 10.5625H9.5M18 18L14.8604 16.2339C14.6224 16.1 14.5034 16.0331 14.3786 15.9859C14.2679 15.9441 14.1539 15.9138 14.0382 15.8955C13.9079 15.875 13.7748 15.875 13.5088 15.875H4.02222C2.96434 15.875 2.4354 15.875 2.03135 15.6434C1.67593 15.4397 1.38697 15.1146 1.20588 14.7148C1 14.2602 1 13.6651 1 12.475V4.4C1 3.20988 1 2.61483 1.20588 2.16027C1.38697 1.76042 1.67593 1.43534 2.03135 1.23161C2.4354 1 2.96435 1 4.02222 1H14.9778C16.0356 1 16.5646 1 16.9687 1.23161C17.3241 1.43534 17.6131 1.76042 17.7941 2.16027C18 2.61483 18 3.20989 18 4.4V18Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Мессенджер
                        </Link>
                    </li>
                    <li className={`${styles.linkBackground} ${currentPage === "friends" && styles.currentPage} ${currentPage === "friends" && styles.currentPageMessanger}`}>                        
                        <Link href={"/friends"}>
                            <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.3849 15H19.2583C20.3794 15 21.3238 13.9994 20.8941 12.9C20.634 12.2343 20.2527 11.6297 19.7721 11.1207C19.2915 10.6117 18.721 10.2084 18.0934 9.93379C17.4657 9.65921 16.7932 9.51879 16.1144 9.52055C15.2689 9.51936 14.4362 9.73922 13.6898 10.1607M10.2996 4.36198C10.2996 6.21875 8.88184 7.72396 7.13292 7.72396C5.384 7.72396 3.96622 6.21875 3.96622 4.36198C3.96622 2.50521 5.384 1 7.13292 1C8.88184 1 10.2996 2.50521 10.2996 4.36198ZM13.0413 12.395C13.0757 12.483 13.1083 12.5718 13.1391 12.6611C13.566 13.8994 12.5227 15 11.2807 15H2.95565C1.71363 15 0.670361 13.8993 1.0973 12.6611C1.41466 11.7406 1.91863 10.8949 2.58401 10.1885C3.78598 8.91237 5.41621 8.19546 7.11606 8.19546C7.9581 8.19487 8.79199 8.37044 9.57009 8.71214C10.3482 9.05384 11.0552 9.55496 11.6508 10.1869C12.2464 10.8188 12.7189 11.5691 13.0413 12.395ZM18.6655 6.09594C18.6655 7.59174 17.5233 8.80433 16.1144 8.80433C14.7055 8.80433 13.5633 7.59174 13.5633 6.09594C13.5633 4.60014 14.7055 3.38756 16.1144 3.38756C17.5233 3.38756 18.6655 4.60014 18.6655 6.09594Z" stroke="black" stroke-width="2"/>
                            </svg>
                            Друзья
                        </Link>
                    </li>
                    <li className={`${styles.linkBackground} ${currentPage === "settings" && styles.currentPage} ${currentPage === "settings" && styles.currentPageMessanger}`}>
                        <Link href={"/settings"}>
                            <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9.5 12.05C10.9937 12.05 12.2046 10.9083 12.2046 9.50001C12.2046 8.09169 10.9937 6.95001 9.5 6.95001C8.00626 6.95001 6.79535 8.09169 6.79535 9.50001C6.79535 10.9083 8.00626 12.05 9.5 12.05Z" stroke="black" stroke-width="2"/>
                                <path d="M11.0916 1.1294C10.7602 1 10.3402 1 9.50001 1C8.65985 1 8.23982 1 7.90841 1.1294C7.46663 1.30195 7.11561 1.63289 6.9326 2.04944C6.84906 2.23959 6.81636 2.46073 6.80357 2.78329C6.78477 3.25733 6.52693 3.69611 6.09119 3.93329C5.65548 4.17047 5.12352 4.16161 4.67869 3.93995C4.37601 3.7891 4.15653 3.70523 3.9401 3.67837C3.46597 3.61951 2.98647 3.74065 2.60708 4.01512C2.32254 4.22097 2.1125 4.56397 1.69244 5.24994C1.27237 5.93592 1.06233 6.27891 1.01552 6.61417C0.953101 7.06118 1.08158 7.51326 1.3727 7.87098C1.50557 8.03426 1.69232 8.17145 1.98216 8.34315C2.40824 8.5956 2.68239 9.02562 2.68236 9.5C2.68234 9.97439 2.40819 10.4043 1.98215 10.6567C1.69227 10.8285 1.5055 10.9657 1.37261 11.129C1.08149 11.4867 0.953011 11.9387 1.01543 12.3858C1.06224 12.721 1.27228 13.0641 1.69235 13.75C2.11242 14.436 2.32246 14.779 2.60699 14.9848C2.98638 15.2593 3.46588 15.3804 3.94001 15.3216C4.15642 15.2947 4.37589 15.2108 4.67856 15.06C5.12341 14.8383 5.6554 14.8295 6.09116 15.0667C6.52691 15.3039 6.78477 15.7427 6.80357 16.2168C6.81637 16.5393 6.84906 16.7604 6.9326 16.9506C7.11561 17.3671 7.46663 17.6981 7.90841 17.8706C8.23982 18 8.65985 18 9.50001 18C10.3402 18 10.7602 18 11.0916 17.8706C11.5334 17.6981 11.8844 17.3671 12.0673 16.9506C12.1509 16.7604 12.1836 16.5393 12.1965 16.2167C12.2152 15.7427 12.473 15.3039 12.9088 15.0667C13.3445 14.8294 13.8765 14.8383 14.3214 15.06C14.6241 15.2108 14.8435 15.2946 15.0599 15.3215C15.534 15.3804 16.0135 15.2593 16.3929 14.9848C16.6774 14.7789 16.8875 14.436 17.3075 13.7499C17.7276 13.064 17.9377 12.721 17.9845 12.3858C18.0469 11.9387 17.9184 11.4866 17.6273 11.1289C17.4944 10.9657 17.3076 10.8284 17.0178 10.6567C16.5918 10.4043 16.3176 9.9743 16.3176 9.49992C16.3176 9.02553 16.5918 8.59569 17.0178 8.34332C17.3077 8.17154 17.4945 8.03435 17.6274 7.87098C17.9185 7.51332 18.047 7.06124 17.9846 6.61422C17.9378 6.27897 17.7277 5.93598 17.3076 5.25C16.8876 4.56402 16.6775 4.22103 16.393 4.01518C16.0136 3.74071 15.5341 3.61957 15.06 3.67843C14.8436 3.70529 14.6241 3.78916 14.3214 3.93998C13.8766 4.16165 13.3446 4.17052 12.9089 3.93332C12.473 3.69612 12.2152 3.25731 12.1965 2.78325C12.1836 2.46071 12.1509 2.23958 12.0673 2.04944C11.8844 1.63289 11.5334 1.30195 11.0916 1.1294Z" stroke="black" stroke-width="2"/>
                            </svg>
                            Настройки
                        </Link>
                    </li>
                </ul>
            </div>
            }
            { user && showSidebar === true && currentMode === "messanger" &&
            <div className={`${styles.sidebar} ${currentMode === "messanger" && styles.sidebarMessanger}`}>
                <div className={styles.top}>
                    { showSidebar === true &&
                        <button className={`${styles.closeButton} ${styles.burgerButton}`} onClick={() => setCurrentMode("default")}>
                            <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4.5 20.25H22.5" stroke="black" stroke-width="2" stroke-linecap="round"/>
                                <path d="M4.5 13.5H22.5" stroke="black" stroke-width="2" stroke-linecap="round"/>
                                <path d="M4.5 6.75H22.5" stroke="black" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </button>
                    }
                    <Logo className={styles.logo}></Logo>
                    { showSidebar === true &&
                        <button className={styles.closeButton} onClick={() => setShowSidebar(false)}>
                            <svg className={styles.closeIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16 8L8 16M8.00001 8L16 16" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></g></svg>
                        </button>
                    }
                </div>
                <div className={styles.previews}>
                    {messanger.map((chatRoom: string) => (
                    <MessangerPreview currentMode={"sidebarMessanger"} key={chatRoom} chatId={chatRoom}/>
                    ))}
                </div>
            </div>
            }
            {   showSidebar === false &&
                <button onClick={() => setShowSidebar(true)} className={styles.openButton}>
                    <svg width="14" height="20" viewBox="0 0 14 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L12 10L1 19" stroke="black" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            }
        </>
    )
}

export default Sidebar;