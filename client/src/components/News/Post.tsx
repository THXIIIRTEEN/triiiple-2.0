import { IPost } from "@/types/user"
import { formateDate } from "@/utils/date";
import UserAvatar from "../UserAvatar";
import { useEffect, useRef, useState } from "react";
import { renderMessageWithEmojis } from "../Messanger/Message";
import MessageForm from "../Messanger/MessageForm/MessageForm";
import { useAuthStore } from "@/utils/store";
import FileProvider from "../Messanger/FileProvider";
import FileDownload from "../Messanger/FileDownload";
import { IFile } from "@/types/user";
import PhotoCollage from "../PhotoCollage";
import { socket } from "@/config/socket";
import CommentList from "./CommentList";
import styles from './styles/post.module.scss'
import Username from "../Username";
import Tag from "../Tag";
import { forwardRef } from "react";
import Link from "next/link";

const Post = forwardRef<HTMLDivElement, IPost>((data, ref) => {
    const [dateString, setDateString] = useState<string>(formateDate(data.date))
    const user = useAuthStore(state => state.user); 
    const [editMode, setEditMode] = useState<boolean>(false); 
    const [mediaFiles, setMediaFiles] = useState<IFile[]>([]); 
    const [ likesCount, setLikesCount ] = useState<number>(data.likes);
    const [ isLiked, setIsLiked ] = useState<boolean>(data.isLiked);
    const [ readCount, setReadCount ] = useState<number>(data.readCount);
    const [ isRead, setIsRead ] = useState<boolean>(data.isRead);
    const [ isCommentsVisible, setIsCommentsVisible ] = useState<boolean>(false);
    const [ commentCount, setCommentCount ] = useState<number>(data.comments);
    const [ showButtons, setShowButtons ] = useState<boolean>(false);

    console.log(data)

    useEffect(() => {
        const dateToString = formateDate(data.date);
        setDateString(dateToString);
    }, [data.date]);

    const handleDeleteMessage = () => {
        if (data && user) {
            console.log('Inside:', data._id)
            socket.emit("deleteMessageNewsRequest", {
                messageId: data._id,
                userId: user.id
            });
        }
    };
    useEffect(() => {
        if (data.files) {
            const filteredFiles = data.files.filter((file) =>
            file.type.startsWith("video") || file.type.startsWith("image")
            );
            setMediaFiles(filteredFiles);
        }
    }, [data.files]);

    const postContainerRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                socket.emit("joinRoom", data._id);
                if (!isRead) {
                    socket.emit("addViewPostNewsRequest", {userId: user?.id, postId: data._id})
                }
            }
            else {
                socket.emit("leaveRoom", data._id);
            }
        });

        if (postContainerRef.current) {
            observer.observe(postContainerRef.current);
        }

        return () => {
            socket.emit("leaveRoom", data._id);
            observer.disconnect();
        };
    }, [data._id, user, isRead]);

    useEffect(() => {
        socket.on('addViewPostNewsResponse', (postData) => {
            if (postData && postData.postId && postData.postId === data._id) {
                setReadCount(postData.readCount);
                if (user && postData.userId === user.id) {
                    setIsRead(postData.isLiked)
                }
            }
        });

        return () => {
            socket.off('addViewPostNewsResponse');
        };
    }, [data._id, user])

    const handleLikePost = () => {
        if (data._id) {
            socket.emit("likePostNewsRequest", {
                postId: data._id,
                userId: user?.id
            });
        }
    }
    useEffect(() => {
        socket.on('likePostNewsResponse', (postData) => {
            if (postData.postId === data._id) {
                setLikesCount(postData.likesCount);
                if (user && postData.userId === user.id) {
                    setIsLiked(postData.isLiked)
                }
            }
        });

        return () => {
            socket.off('likePostNewsResponse');
        };
    }, [data._id, user])

    return (
        <div ref={postContainerRef} className={styles.block}>
            <div className={styles.postHead} ref={ref}>
                <Link className={styles.profileLink} href={`/profile/${data.author.tag}`}>
                    <UserAvatar id={data.author._id} className={styles.profile}/>
                </Link> 
                <div className={styles.postHeadText}>
                    { data.author.tag && <Username className={styles.username} username={data.author.username} tag={data.author.tag}/>}
                    { data.author.tag && <Tag className={styles.tag} tag={data.author.tag}/>}
                </div>
                { user && data.author._id === user.id &&
                    <button className={styles.postHeadButton} onClick={() => setShowButtons(!showButtons)}>
                    { !showButtons ?
                        <svg viewBox="0 0 24 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 0C12.4747 0 12.9387 0.146623 13.3334 0.421326C13.728 0.696029 14.0357 1.08648 14.2173 1.54329C14.399 2.00011 14.4465 2.50277 14.3539 2.98773C14.2613 3.47268 14.0327 3.91813 13.6971 4.26777C13.3614 4.6174 12.9338 4.8555 12.4682 4.95196C12.0027 5.04842 11.5201 4.99892 11.0816 4.8097C10.643 4.62048 10.2682 4.30005 10.0045 3.88892C9.74076 3.4778 9.6 2.99445 9.6 2.5C9.6 1.83696 9.85286 1.20107 10.3029 0.732232C10.753 0.263392 11.3635 0 12 0ZM0 2.5C0 2.99445 0.140758 3.4778 0.404473 3.88892C0.668188 4.30005 1.04302 4.62048 1.48156 4.8097C1.9201 4.99892 2.40266 5.04842 2.86822 4.95196C3.33377 4.8555 3.76141 4.6174 4.09706 4.26777C4.4327 3.91813 4.66128 3.47268 4.75388 2.98773C4.84649 2.50277 4.79896 2.00011 4.61731 1.54329C4.43566 1.08648 4.12805 0.696029 3.73337 0.421326C3.33869 0.146623 2.87468 0 2.4 0C1.76348 0 1.15303 0.263392 0.702944 0.732232C0.252856 1.20107 0 1.83696 0 2.5ZM19.2 2.5C19.2 2.99445 19.3408 3.4778 19.6045 3.88892C19.8682 4.30005 20.243 4.62048 20.6816 4.8097C21.1201 4.99892 21.6027 5.04842 22.0682 4.95196C22.5338 4.8555 22.9614 4.6174 23.2971 4.26777C23.6327 3.91813 23.8613 3.47268 23.9539 2.98773C24.0465 2.50277 23.999 2.00011 23.8173 1.54329C23.6357 1.08648 23.328 0.696029 22.9334 0.421326C22.5387 0.146623 22.0747 0 21.6 0C20.9635 0 20.353 0.263392 19.9029 0.732232C19.4529 1.20107 19.2 1.83696 19.2 2.5Z" fill="#919191"/>
                        </svg>
                        :
                        <svg className={styles.closeIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16 8L8 16M8.00001 8L16 16" stroke="#919191" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></g></svg>
                    }
                    </button>
                }
                { user && data.author._id === user.id && showButtons && (
                    <div className={styles.actionsBlock}>
                        <button type="button" onClick={() => setEditMode(!editMode)}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -0.5 25 25" fill="none">
                                <path d="M13.2942 7.95881C13.5533 7.63559 13.5013 7.16358 13.178 6.90453C12.8548 6.64549 12.3828 6.6975 12.1238 7.02072L13.2942 7.95881ZM6.811 14.8488L7.37903 15.3385C7.38489 15.3317 7.39062 15.3248 7.39623 15.3178L6.811 14.8488ZM6.64 15.2668L5.89146 15.2179L5.8908 15.2321L6.64 15.2668ZM6.5 18.2898L5.7508 18.2551C5.74908 18.2923 5.75013 18.3296 5.75396 18.3667L6.5 18.2898ZM7.287 18.9768L7.31152 19.7264C7.36154 19.7247 7.41126 19.7181 7.45996 19.7065L7.287 18.9768ZM10.287 18.2658L10.46 18.9956L10.4716 18.9927L10.287 18.2658ZM10.672 18.0218L11.2506 18.4991L11.2571 18.491L10.672 18.0218ZM17.2971 10.959C17.5562 10.6358 17.5043 10.1638 17.1812 9.90466C16.8581 9.64552 16.386 9.69742 16.1269 10.0206L17.2971 10.959ZM12.1269 7.02052C11.8678 7.34365 11.9196 7.81568 12.2428 8.07484C12.5659 8.33399 13.0379 8.28213 13.2971 7.95901L12.1269 7.02052ZM14.3 5.50976L14.8851 5.97901C14.8949 5.96672 14.9044 5.95412 14.9135 5.94123L14.3 5.50976ZM15.929 5.18976L16.4088 4.61332C16.3849 4.59344 16.3598 4.57507 16.3337 4.5583L15.929 5.18976ZM18.166 7.05176L18.6968 6.52192C18.6805 6.50561 18.6635 6.49007 18.6458 6.47532L18.166 7.05176ZM18.5029 7.87264L19.2529 7.87676V7.87676L18.5029 7.87264ZM18.157 8.68976L17.632 8.15412C17.6108 8.17496 17.5908 8.19704 17.5721 8.22025L18.157 8.68976ZM16.1271 10.0203C15.8678 10.3433 15.9195 10.8153 16.2425 11.0746C16.5655 11.3339 17.0376 11.2823 17.2969 10.9593L16.1271 10.0203ZM13.4537 7.37862C13.3923 6.96898 13.0105 6.68666 12.6009 6.74805C12.1912 6.80943 11.9089 7.19127 11.9703 7.60091L13.4537 7.37862ZM16.813 11.2329C17.2234 11.1772 17.5109 10.7992 17.4552 10.3888C17.3994 9.97834 17.0215 9.69082 16.611 9.74659L16.813 11.2329ZM12.1238 7.02072L6.22577 14.3797L7.39623 15.3178L13.2942 7.95881L12.1238 7.02072ZM6.24297 14.359C6.03561 14.5995 5.91226 14.9011 5.89159 15.218L7.38841 15.3156C7.38786 15.324 7.38457 15.3321 7.37903 15.3385L6.24297 14.359ZM5.8908 15.2321L5.7508 18.2551L7.2492 18.3245L7.3892 15.3015L5.8908 15.2321ZM5.75396 18.3667C5.83563 19.1586 6.51588 19.7524 7.31152 19.7264L7.26248 18.2272C7.25928 18.2273 7.25771 18.2268 7.25669 18.2264C7.25526 18.2259 7.25337 18.2249 7.25144 18.2232C7.2495 18.2215 7.24825 18.2198 7.24754 18.2185C7.24703 18.2175 7.24637 18.216 7.24604 18.2128L5.75396 18.3667ZM7.45996 19.7065L10.46 18.9955L10.114 17.536L7.11404 18.247L7.45996 19.7065ZM10.4716 18.9927C10.7771 18.9151 11.05 18.7422 11.2506 18.499L10.0934 17.5445C10.0958 17.5417 10.0989 17.5397 10.1024 17.5388L10.4716 18.9927ZM11.2571 18.491L17.2971 10.959L16.1269 10.0206L10.0869 17.5526L11.2571 18.491ZM13.2971 7.95901L14.8851 5.97901L13.7149 5.04052L12.1269 7.02052L13.2971 7.95901ZM14.9135 5.94123C15.0521 5.74411 15.3214 5.6912 15.5243 5.82123L16.3337 4.5583C15.4544 3.99484 14.2873 4.2241 13.6865 5.0783L14.9135 5.94123ZM15.4492 5.7662L17.6862 7.6282L18.6458 6.47532L16.4088 4.61332L15.4492 5.7662ZM17.6352 7.58161C17.7111 7.6577 17.7535 7.761 17.7529 7.86852L19.2529 7.87676C19.2557 7.36905 19.0555 6.88127 18.6968 6.52192L17.6352 7.58161ZM17.7529 7.86852C17.7524 7.97604 17.7088 8.07886 17.632 8.15412L18.682 9.22541C19.0446 8.87002 19.2501 8.38447 19.2529 7.87676L17.7529 7.86852ZM17.5721 8.22025L16.1271 10.0203L17.2969 10.9593L18.7419 9.15928L17.5721 8.22025ZM11.9703 7.60091C12.3196 9.93221 14.4771 11.5503 16.813 11.2329L16.611 9.74659C15.0881 9.95352 13.6815 8.89855 13.4537 7.37862L11.9703 7.60091Z" fill="#000000"/>
                            </svg>
                            { !editMode ? 'Редактировать' : 'Отменить правки'}
                        </button>
                        <button className={styles.deleteButton} type="button" onClick={handleDeleteMessage}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none">
                                <path d="M4 6H20L18.4199 20.2209C18.3074 21.2337 17.4512 22 16.4321 22H7.56786C6.54876 22 5.69264 21.2337 5.5801 20.2209L4 6Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M7.34491 3.14716C7.67506 2.44685 8.37973 2 9.15396 2H14.846C15.6203 2 16.3249 2.44685 16.6551 3.14716L18 6H6L7.34491 3.14716Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M2 6H22" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M10 11V16" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M14 11V16" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Удалить
                        </button>
                    </div>
                )}
            </div>
            <div className={styles.photoCollage}>{mediaFiles.length > 0 && <PhotoCollage photos={mediaFiles} className={styles.photos} />}</div>
            {!editMode ? (
                <p className={styles.text}>{renderMessageWithEmojis(data.text)}</p>
            ) : (
                <MessageForm className={styles.editForm} type="edit" user={user!} value={data.text} messageId={data._id} setEditMode={setEditMode} page="News"/>
            )}
            <div className={styles.files}>
                {data.files?.map((file) => {
                    if (file.type.split("/")[0] !== "image" && file.type.split("/")[0] !== "video") {
                    return (
                        <FileProvider key={file._id} file={file}>
                        {(signedUrl: string) => {
                            if (!signedUrl) {
                            return <div>Loading...</div>;
                            }
                            return <FileDownload file={file} signedUrl={signedUrl} />;
                        }}
                        </FileProvider>
                    );
                    }
                    return null;
                })}
            </div>
            <div className={styles.bottomButtons}>
                {   isLiked ?
                <div>
                    <button type="button" onClick={() => handleLikePost()}>
                        <svg viewBox="0 0 29 26" fill="#000" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M14.5 4.71229C16.9992 1.82321 21.1753 0.930354 24.3066 3.57589C27.4379 6.22142 27.8788 10.6446 25.4197 13.7735C23.3752 16.3749 17.1878 21.8616 15.1599 23.6375C14.933 23.8362 14.8196 23.9355 14.6872 23.9745C14.5718 24.0085 14.4454 24.0085 14.3298 23.9745C14.1975 23.9355 14.0842 23.8362 13.8572 23.6375C11.8293 21.8616 5.64192 16.3749 3.59734 13.7735C1.13831 10.6446 1.52539 6.19359 4.71053 3.57589C7.89567 0.958184 12.0008 1.82321 14.5 4.71229Z" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <span>{likesCount}</span>
                </div>
                :
                <div>
                    <button type="button" onClick={() => handleLikePost()}>
                        <svg viewBox="0 0 29 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M14.5 4.71229C16.9992 1.82321 21.1753 0.930354 24.3066 3.57589C27.4379 6.22142 27.8788 10.6446 25.4197 13.7735C23.3752 16.3749 17.1878 21.8616 15.1599 23.6375C14.933 23.8362 14.8196 23.9355 14.6872 23.9745C14.5718 24.0085 14.4454 24.0085 14.3298 23.9745C14.1975 23.9355 14.0842 23.8362 13.8572 23.6375C11.8293 21.8616 5.64192 16.3749 3.59734 13.7735C1.13831 10.6446 1.52539 6.19359 4.71053 3.57589C7.89567 0.958184 12.0008 1.82321 14.5 4.71229Z" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <span>{likesCount}</span>
                </div>
                }
                
                <div>
                    <button onClick={() => setIsCommentsVisible(!isCommentsVisible)}>
                        <svg viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M2 16.9238C2.02212 18.733 2.81348 20.46 4.19995 21.7247C5.58639 22.9893 7.45438 23.688 9.39286 23.6672H10.3929L13.3571 26.5538C13.6591 26.8393 14.0711 27 14.5009 27C14.9307 27 15.3427 26.8393 15.6446 26.5538L18.6071 23.6672H19.6071C21.5457 23.688 23.4136 22.9893 24.8 21.7247C26.1864 20.46 26.9779 18.733 27 16.9238V8.74047C26.952 4.97417 23.6425 1.95695 19.6071 2.00046H9.39286C5.35752 1.95695 2.04804 4.97417 2 8.74047V16.9238Z" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M9.14275 9.08374C8.40309 9.08374 7.80347 9.64339 7.80347 10.3337C7.80347 11.0241 8.40309 11.5837 9.14275 11.5837V9.08374ZM19.857 11.5837C20.5967 11.5837 21.1963 11.0241 21.1963 10.3337C21.1963 9.64339 20.5967 9.08374 19.857 9.08374V11.5837ZM9.14275 14.0837C8.40309 14.0837 7.80347 14.6433 7.80347 15.3337C7.80347 16.0242 8.40309 16.5837 9.14275 16.5837V14.0837ZM19.857 16.5837C20.5967 16.5837 21.1963 16.0242 21.1963 15.3337C21.1963 14.6433 20.5967 14.0837 19.857 14.0837V16.5837ZM9.14275 11.5837H19.857V9.08374H9.14275V11.5837ZM9.14275 16.5837H19.857V14.0837H9.14275V16.5837Z" fill="black"/>
                        </svg>
                    </button>
                    <span>{commentCount}</span>
                </div>
                
                <span className={styles.views}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                        <path d="M12 18.75C6.17 18.75 3.43 12.56 3.31 12.3C3.27039 12.2049 3.25 12.103 3.25 12C3.25 11.897 3.27039 11.7951 3.31 11.7C3.43 11.44 6.17 5.25 12 5.25C17.83 5.25 20.57 11.44 20.69 11.7C20.7296 11.7951 20.75 11.897 20.75 12C20.75 12.103 20.7296 12.2049 20.69 12.3C20.57 12.56 17.83 18.75 12 18.75ZM4.83 12C5.42 13.15 7.83 17.25 12 17.25C16.17 17.25 18.58 13.15 19.17 12C18.58 10.85 16.17 6.75 12 6.75C7.83 6.75 5.42 10.85 4.83 12Z" fill="#919191"/>
                        <path d="M12 15.25C11.3572 15.25 10.7289 15.0594 10.1944 14.7023C9.65994 14.3452 9.24338 13.8376 8.99739 13.2437C8.75141 12.6499 8.68705 11.9964 8.81245 11.366C8.93785 10.7355 9.24738 10.1564 9.7019 9.7019C10.1564 9.24738 10.7355 8.93785 11.366 8.81245C11.9964 8.68705 12.6499 8.75141 13.2437 8.99739C13.8376 9.24338 14.3452 9.65994 14.7023 10.1944C15.0594 10.7289 15.25 11.3572 15.25 12C15.2474 12.8611 14.9041 13.6863 14.2952 14.2952C13.6863 14.9041 12.8611 15.2474 12 15.25ZM12 10.25C11.6539 10.25 11.3155 10.3526 11.0278 10.5449C10.74 10.7372 10.5157 11.0105 10.3832 11.3303C10.2508 11.6501 10.2161 12.0019 10.2836 12.3414C10.3512 12.6809 10.5178 12.9927 10.7626 13.2374C11.0073 13.4822 11.3191 13.6489 11.6586 13.7164C11.9981 13.7839 12.3499 13.7492 12.6697 13.6168C12.9895 13.4843 13.2628 13.26 13.4551 12.9722C13.6474 12.6845 13.75 12.3461 13.75 12C13.7474 11.5367 13.5622 11.0931 13.2345 10.7655C12.9069 10.4378 12.4633 10.2526 12 10.25Z" fill="#919191"/>
                    </svg>
                    {readCount}
                </span>
                <p className={styles.date}>{dateString}</p>
            </div>
            {   data._id && isCommentsVisible &&
                <CommentList postId={data._id} setCommentCount={setCommentCount} setIsCommentsVisible={setIsCommentsVisible}/>
            }
        </div>
    )
})

Post.displayName = "Post";

export default Post;