import { IFile } from "@/types/user";
import { useEffect, useRef, useState } from "react";
import { Dispatch, SetStateAction } from "react";
import styles from "./media-carousel.module.scss"

interface IMediaCarouselProps {
    children: JSX.Element;
    files: IFile[];
    currentlyMediaView: IFile;
    setCurrentlyMediaView: Dispatch<SetStateAction<IFile | null>>
}

const MediaCarousel: React.FC<IMediaCarouselProps> = ({ children, files, currentlyMediaView, setCurrentlyMediaView }) => {
    const [ currentMediaId, setCurrentMediaId ] = useState<number | null>(NaN);

    const popover = useRef<HTMLDivElement>(null); 

    useEffect(() => {
        const id = files.findIndex((file) => file._id === currentlyMediaView._id);
        setCurrentMediaId(id);
    }, [files, currentlyMediaView]);

    const handleClickOutside = (event: MouseEvent) => {
        if (popover.current && !popover.current.contains(event.target as Node)) {
            setCurrentlyMediaView(null); 
        }
      };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
    
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []); 

    const handleClickPrevious = () => {
        if (currentMediaId === 0) {
            setCurrentlyMediaView(files[files.length - 1])
        }
        else {
            setCurrentlyMediaView(files[currentMediaId! - 1])
        }
    }

    const handleClickNext = () => {
        if (currentMediaId === files.length - 1) {
            setCurrentlyMediaView(files[0])
        }
        else {
            setCurrentlyMediaView(files[currentMediaId! + 1])
        }
    }

    return (
        <div className={styles.background}>  
            <div className={styles['popover']}>
                <div className={styles['popover__block']} ref={popover}>
                    <div className={styles['popover__top']}>
                        <button onClick={handleClickPrevious} className={styles.button}>
                            <svg width="14" height="20" viewBox="0 0 14 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13 1L2 10L13 19" stroke="black" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </button>
                        { children }
                        <button onClick={handleClickNext} className={styles.button}>
                            <svg width="14" height="20" viewBox="0 0 14 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1L12 10L1 19" stroke="black" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </button>
                    </div>
                    <div className={styles['popover__bottom']}> 
                        {   files.map((file) => {
                            return (
                                file._id === currentlyMediaView._id ? <div className={styles['popover__circle--active']} key={file._id}></div>
                                :
                                <div className={styles['popover__circle']} key={file._id}></div>
                            )
                        })
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MediaCarousel;