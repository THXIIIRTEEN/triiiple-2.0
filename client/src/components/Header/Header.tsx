import { useCallback, useState } from "react";
import Notifications from "../Notifications/Notifications";
import styles from "./header.module.scss"
import Category from "./Category";

const Header: React.FC = () => {

    const [ value, setValue ] = useState(""); 
    const [ showList, setShowList ] = useState(false);
    const categories = [
        {name: 'users', text: <p>Искать <b>{value}</b> в списке пользователей</p>},
    ];

    const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;

        if (newValue.length === 0) {
            setShowList(false);
        } else if (newValue.length === 1) {
            setShowList(true);
        }

        setValue(newValue);
    }, []);
    

    return (
        <>
        <div className={styles.background}> 
            <div className={styles.searchBlock}>
                <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.5064 14.5228L20 20M16.8333 8.91667C16.8333 13.2889 13.2889 16.8333 8.91667 16.8333C4.54441 16.8333 1 13.2889 1 8.91667C1 4.54441 4.54441 1 8.91667 1C13.2889 1 16.8333 4.54441 16.8333 8.91667Z" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <input type="text" placeholder="Поиск" onChange={handleInput} value={value}/>
            </div>
            
            <Notifications/>
        </div>
        {   showList &&
            <div className={styles.categoriesWrapper}>
                <ul className={styles.categoriesList}>
                    {   categories.map((category, index) => {
                        return (
                            <Category key={index} category={category} value={value} setValue={setValue} setShowList={setShowList}/>
                        )
                    })
                    }
                </ul>
            </div>
        }
        </>
    );
}

export default Header;