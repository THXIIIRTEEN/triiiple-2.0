import axios from "axios";
import styles from "./header.module.scss";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { IUser } from "@/types/user";
import FriendBlock from "../Friends/FriendBlock";

interface ICategoryProps {
    category: {
        name: string;
        text: JSX.Element;
        
    };
    value: string;
    setValue: Dispatch<SetStateAction<string>>;
    setShowList: Dispatch<SetStateAction<boolean>>;
}

const Category: React.FC<ICategoryProps> = ({category, value, setValue, setShowList}) => {

    const { name, text } = category;
    const [ resultArray, setResultArray ] = useState<IUser[] | []>([]);
    const [ showResults, setShowResults ] = useState<boolean>(false)

    const handleSearch = async () => {
        const response = await axios.post(`${process.env.API_URI}/search`, {name, value}); 
        
        if (response) {
            setResultArray(response.data.result);
            setShowResults(true);
            setValue("");
        }
    }

    const closeWindow = () => {
        setShowResults(false);
        setShowList(false);
    }

    const wrapperRef = useRef<HTMLDivElement>(null); 

    useEffect(() => { 
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowResults(false);
                setShowList(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [setShowList]);

    return (
        <>
            <li className={styles.category} onClick={() => handleSearch()}>
                {   name === "users" &&
                    <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.3849 15H19.2583C20.3794 15 21.3238 13.9994 20.8941 12.9C20.634 12.2343 20.2527 11.6297 19.7721 11.1207C19.2915 10.6117 18.721 10.2084 18.0934 9.93379C17.4657 9.65921 16.7932 9.51879 16.1144 9.52055C15.2689 9.51936 14.4362 9.73922 13.6898 10.1607M10.2996 4.36198C10.2996 6.21875 8.88184 7.72396 7.13292 7.72396C5.384 7.72396 3.96622 6.21875 3.96622 4.36198C3.96622 2.50521 5.384 1 7.13292 1C8.88184 1 10.2996 2.50521 10.2996 4.36198ZM13.0413 12.395C13.0757 12.483 13.1083 12.5718 13.1391 12.6611C13.566 13.8994 12.5227 15 11.2807 15H2.95565C1.71363 15 0.670361 13.8993 1.0973 12.6611C1.41466 11.7406 1.91863 10.8949 2.58401 10.1885C3.78598 8.91237 5.41621 8.19546 7.11606 8.19546C7.9581 8.19487 8.79199 8.37044 9.57009 8.71214C10.3482 9.05384 11.0552 9.55496 11.6508 10.1869C12.2464 10.8188 12.7189 11.5691 13.0413 12.395ZM18.6655 6.09594C18.6655 7.59174 17.5233 8.80433 16.1144 8.80433C14.7055 8.80433 13.5633 7.59174 13.5633 6.09594C13.5633 4.60014 14.7055 3.38756 16.1144 3.38756C17.5233 3.38756 18.6655 4.60014 18.6655 6.09594Z" stroke="black" stroke-width="2"/>
                    </svg>
                }
                {text}
            </li>
            { showResults && 
                <div className={styles.categoryResultWrapper}>
                    <div className={styles.categoryResult} ref={wrapperRef}>
                        <button className={styles.deleteButton} onClick={() => closeWindow()}>
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16 8L8 16M8.00001 8L16 16" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></g></svg>
                        </button>
                        <div className={styles.resultList}>
                            {   name === 'users' && resultArray.map((res, index) => {
                                return (
                                    <FriendBlock key={index} {...res}/>
                                )
                            })
                            }
                        </div>
                    </div>
                </div>
            }
        </>

    )
}

export default Category;