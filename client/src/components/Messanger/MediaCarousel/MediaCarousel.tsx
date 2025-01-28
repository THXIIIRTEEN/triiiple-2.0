import { IFile } from "@/types/user";
import { useEffect, useRef, useState } from "react";
import { Dispatch, SetStateAction } from "react";
import styles from "./media-carousel.module.css"

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
        <> 
            <div className={styles['popover']}>
                <div className={styles['popover__block']} ref={popover}>
                    <div className={styles['popover__top']}>
                        <button onClick={handleClickPrevious}>previous</button>
                        { children }
                        <button onClick={handleClickNext}>next</button>
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
        </>
    )
}

export default MediaCarousel;