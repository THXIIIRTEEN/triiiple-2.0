import Header from "@/components/Header/Header";
import Protected from "@/components/Protected";
import Sidebar from "@/components/Sidebar/Sidebar";
import { useAuthStore } from "@/utils/store";
import styles from './styles/friends.module.scss';
import { useState } from "react";
import FriendsPage from "@/components/Friends/FriendsPage";
import RequestsPage from "@/components/Friends/RequestsPage";

const Friends: React.FC = () => {

    const user = useAuthStore().user;
    const [ currentMode, setCurrentMode ] = useState<string | null>("friends");
    
    return (
        <>
            <Protected>
                <Header/>
                <div className={styles.page}>
                    <Sidebar currentPage="friends"/>
                    {   user && user.id &&
                        <div className={styles.friendsPage}>
                            { currentMode === "friends" && <FriendsPage currentPage="friends" className={styles.contentBlock} profileId={user.id}/>}
                            { currentMode === "requests" && <RequestsPage currentPage="friends" className={styles.contentBlock} profileId={user.id}/>}
                            <div className={styles.changeMode}>
                                <button className={currentMode === "friends" ? styles.activeButton : undefined} onClick={() => setCurrentMode("friends")}>Друзья</button>
                                <button className={currentMode === "requests" ? styles.activeButton : undefined} onClick={() => setCurrentMode("requests")}>Запросы в друзья</button>
                            </div>
                        </div>
                    }
                </div>
            </Protected>
        </>
    );
}

export default Friends;