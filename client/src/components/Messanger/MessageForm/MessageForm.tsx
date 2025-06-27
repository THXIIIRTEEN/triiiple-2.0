import { IUser } from "@/types/user";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { socket } from "@/config/socket";
import { verifyCorrectSymbols } from "@/utils/textValidation";
import emojiData from "@emoji-mart/data/sets/15/all.json";
import Picker from "@emoji-mart/react";
import FilePreview from "../FilePreview/FilePreview";
import FilePreviewScroll from "../FilePreview/FilePreviewScroll";
import axios, { AxiosError, AxiosProgressEvent } from "axios";
import { getToken } from "@/utils/cookies";
import styles from "./message-form.module.scss"

interface IMessageForm {
  type: string;
  user: IUser;
  value?: string;
  messageId?: string;
  page?: 'News' | 'Chat' | 'Comment' | 'AboutUser';
  postId?: string;
  setEditMode?: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
  key?: string;
}

const MessageForm: React.FC<IMessageForm> = ({ type, user, value, messageId, setEditMode, page, postId, className, key }) => {
  const router = useRouter();

  const [ message, setMessage ] = useState<string>(value ? value : "");
  const [ error, setError ] = useState<string | null>(null);
  const [ showEmojiPicker, setShowEmojiPicker ] = useState<boolean>(false);
  const [ cursorPosition, setCursorPosition ] = useState<number | null>(null);
  const [ files, setFiles ] = useState<(File)[]>([]);
  const [ progress, setProgress ] = useState<number>(0);
  const [ placeholder, setPlaceholder ] = useState<string>('');

  const chatId = router.query.id as string || true;
  const token = getToken();

  const currentPage = page || 'Chat' || 'Comment';

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (page === 'AboutUser') {
      socket.connect();
      socket.emit('joinRoom', `edit-about-me-${user.id}`);
    }
  }, [page, user])

  useEffect(() => {
    const fetchAboutUser = async () => {
      try {
        const response = await axios.post(`${process.env.API_URI}/fetch-about-user`, {userId: user.id}, { 
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response && response.status === 200) {
          setPlaceholder(response.data.about_user);
        }
      }
      catch(error) {
        console.log(error)
      }
    }
    if (page === 'AboutUser') {
      fetchAboutUser();
    }
  }, [page, token, user]);

  useEffect(() => {
    socket.on('sendMessageAboutUserResponse', (data) => {
        setPlaceholder(data.about_user)
    });

    return () => {
        socket.off('sendMessageAboutUserResponse');
    };
  }, []);

  const handleEmojiClick = (emoji: { shortcodes: string }) => {
    if (textareaRef.current) {
      const position = textareaRef.current.selectionStart;
      const newText = 
        message.slice(0, position) + " " +
        emoji.shortcodes + " " +
        message.slice(position);

      setMessage(newText);
      setCursorPosition(position + emoji.shortcodes.length + 2);
    }
  };

  useEffect(() => {
    if (textareaRef.current && cursorPosition !== null) {
      textareaRef.current.selectionStart = cursorPosition;
      textareaRef.current.selectionEnd = cursorPosition;
      textareaRef.current.focus();
      setCursorPosition(null);
    }
  }, [cursorPosition]);

  const sendMessageWithoutFiles = async () => {
    if (currentPage === "Chat") {
      socket.emit("sendMessageRequest", {
        author: user!.id,
        chatId: chatId,
        text: message
      });
      setMessage(""); 
      setError(null);
    }
    else if (currentPage === "Comment") {
      socket.emit(`sendMessage${currentPage}Request`, {
        author: user!.id,
        text: message,
        postId: postId
      });
      setMessage(""); 
      setError(null);
    }
    else {
      socket.emit(`sendMessage${currentPage}Request`, {
        author: user!.id,
        text: message
      });
      setMessage(""); 
      setError(null);
    }
}

  const fileInputRef = useRef<HTMLInputElement>(null)

  const sendMessageWithFiles = async () => {
    const maxTotalSize = 50 * 1024 * 1024;
    const formData = new FormData();

    const totalSize = files.reduce((acc, file) => acc + file.size, 0);

    if (totalSize > maxTotalSize) {
      setError(`Общий размер файлов превышает допустимый лимит. Максимальный размер: 50 МБ`);
      return;
    }

    files.forEach((file) => {
      formData.append('files', file);
    });

    const messageData = {
      author: user!.id,
      chatId: chatId,
      text: message,
    }
    if (postId) {
      //@ts-expect-error xdddd
      messageData.postId = postId;
    }
    formData.append('message', JSON.stringify(messageData));

    try {
      if (currentPage === 'Chat') {
        await axios.post(`${process.env.API_URI}/send-file`, formData, {
          headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
          },
          onUploadProgress: ((progressEvent: AxiosProgressEvent) => { 
            if (progressEvent && progressEvent.total) {
              const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
              setProgress(percent);
            }
          })
        });
      }
      else {
        await axios.post(`${process.env.API_URI}/send-file-${currentPage}`, formData, {
          headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
          },
          onUploadProgress: ((progressEvent: AxiosProgressEvent) => { 
            if (progressEvent && progressEvent.total) {
              const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
              setProgress(percent);
            }
          })
        });
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setMessage(""); 
      setFiles([]);
      setError(null);
    }
    catch (error) {
      if (error instanceof AxiosError) {
        setError(error.response?.data);  
      } else {
        setError("Произошла неизвестная ошибка"); 
      }
    }
    finally {
      setProgress(0);
    }
  }

  const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (user && user.id && chatId) {
      if (files.length === 0) {
        if (verifyCorrectSymbols({ message: message }, setError)) {
          sendMessageWithoutFiles();
        }
      }
      else if (files.length > 0) {
        if (verifyCorrectSymbols({ message: message }, setError, true)) {
          sendMessageWithFiles();
        }
      }
      resetTextAreaStyles();
    }
  };

  const editMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (user && user.id) {
      if (verifyCorrectSymbols({ message: message }, setError)) {
        if (currentPage === "Chat") {
          socket.emit("editMessageRequest", {
            messageId: messageId,
            text: message,
            chatId: chatId,
            isEdited: true
          });
        }
        else {
          socket.emit(`editMessage${currentPage}Request`, {
            userId: user.id,
            messageId: messageId,
            text: message,
            ...(postId && { postId })
          });
        };
        setMessage(""); 
        setError(null);
        resetTextAreaStyles();
        if (setEditMode) {
          setEditMode(false)
        }
      }
    }
  }

  const MAX_FILES = 10;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const maxTotalSize = 50 * 1024 * 1024;

    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      const totalSize = newFiles.reduce((acc, file) => acc + file.size, 0);

      if (files.length + newFiles.length > MAX_FILES) {
        setError(`Вы не можете загрузить больше ${MAX_FILES} файлов`);
      } 
      else if (totalSize > maxTotalSize) {
        setError(`Общий размер файлов превышает допустимый лимит. Максимальный размер: 50 МБ`);
      }
      else {
        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setError(null);
      }
    }
  }

  const postForm = useRef<HTMLFormElement | null>(null);
  const buttonsBlockRef = useRef<HTMLDivElement | null>(null)

  const resetTextAreaStyles = () => {
    if (postForm && postForm.current && textareaRef && buttonsBlockRef.current) {
      postForm.current.style.alignItems = 'center';   
      textareaRef.current!.style.height = '0.625rem';
      buttonsBlockRef.current.style.height = '1rem'
    }
  }

  useEffect(() => {
    if (message && postForm && postForm.current && buttonsBlockRef.current) {
        const textarea = textareaRef.current;
        textarea!.style.height = '0.625rem';
        textarea!.style.height = textarea!.scrollHeight + 'px';
        buttonsBlockRef.current.style.height = textarea!.scrollHeight + 'px';
    }
  }, [message]);

  useEffect(() => {
    if (textareaRef.current?.clientHeight === 32 || textareaRef.current?.value.trim() == '') {
        resetTextAreaStyles();
    }
  }, [message])

  return (
    <>
      <form key={key} ref={postForm} className={`${styles.messageForm} ${className}`} onSubmit={type === "send" ? (event) => sendMessage(event) : (event) => editMessage(event)}>
        { files.length > 0 &&
          <FilePreviewScroll>
            {files.map((file, index) => (
              <FilePreview key={index} setFiles={setFiles} file={file}/>
            ))}
          </FilePreviewScroll>
        }
        { progress > 0 && 
          <div className={styles['progressbar__background']}>
            <div style={{width: `${progress}%`}} className={styles['progressbar']}>
            </div>
          </div>
        }
        <textarea
          onChange={(event) => setMessage(event.target.value)}
          value={message}
          rows={4}
          style={{ whiteSpace: 'pre-wrap' }}
          ref={textareaRef}
          placeholder={placeholder || "Расскажите как прошёл ваш день"}
          cols={30}
        ></textarea>
        <div ref={buttonsBlockRef} className={styles.buttonBlock}>
          <button type="button" onClick={toggleEmojiPicker}>
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#clip0_5_522)">
              <path d="M6.02083 7.79169C6.60763 7.79169 7.08333 7.31597 7.08333 6.72919C7.08333 6.14238 6.60763 5.66669 6.02083 5.66669C5.43402 5.66669 4.95833 6.14238 4.95833 6.72919C4.95833 7.31597 5.43402 7.79169 6.02083 7.79169Z" fill="white"/>
              <path d="M12.0417 6.72919C12.0417 7.31597 11.566 7.79169 10.9792 7.79169C10.3924 7.79169 9.91667 7.31597 9.91667 6.72919C9.91667 6.14238 10.3924 5.66669 10.9792 5.66669C11.566 5.66669 12.0417 6.14238 12.0417 6.72919Z" fill="white"/>
              <path d="M6.29619 9.59182C6.11873 9.24792 5.69719 9.10965 5.35004 9.28327C5.00014 9.45823 4.85831 9.88372 5.03326 10.2336C5.09167 10.35 5.16605 10.4592 5.24403 10.5632C5.37352 10.7358 5.56898 10.9582 5.84411 11.1783C6.40336 11.6257 7.26558 12.0418 8.50014 12.0418C9.73469 12.0418 10.5969 11.6257 11.1562 11.1783C11.4313 10.9582 11.6268 10.7358 11.7563 10.5632C11.8345 10.4588 11.9057 10.3497 11.9666 10.2343C12.1399 9.88903 11.9958 9.45603 11.6502 9.28327C11.3031 9.10965 10.8816 9.24792 10.7041 9.59182C10.6943 9.60946 10.561 9.84016 10.2712 10.0721C9.94507 10.3329 9.39058 10.6251 8.50014 10.6251C7.60969 10.6251 7.05526 10.3329 6.7291 10.0721C6.43925 9.84016 6.30597 9.60946 6.29619 9.59182Z" fill="white"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M8.49999 16.2916C12.8032 16.2916 16.2917 12.8032 16.2917 8.49998C16.2917 4.19676 12.8032 0.708313 8.49999 0.708313C4.19678 0.708313 0.708328 4.19676 0.708328 8.49998C0.708328 12.8032 4.19678 16.2916 8.49999 16.2916ZM8.49999 14.8702C4.98185 14.8702 2.12983 12.0181 2.12983 8.49998C2.12983 4.98184 4.98185 2.12982 8.49999 2.12982C12.0181 2.12982 14.8702 4.98184 14.8702 8.49998C14.8702 12.0181 12.0181 14.8702 8.49999 14.8702Z" fill="white"/>
              </g>
              <defs>
              <clipPath id="clip0_5_522">
              <rect width="17" height="17" fill="white"/>
              </clipPath>
              </defs>
            </svg>
          </button>
          { currentPage !== "AboutUser" &&
            <>
              <label htmlFor={`file-input-${page}`} style={{ cursor: 'pointer' }}>
                <div>
                  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.6224 12.1914L9.05856 10.6407C8.30397 9.89228 7.92663 9.51812 7.49369 9.38134C7.11288 9.26106 6.70356 9.26547 6.32545 9.394C5.89551 9.54016 5.52638 9.92237 4.78814 10.6868L1.04133 14.3876M10.6224 12.1914L10.9425 11.8741C11.698 11.1248 12.0757 10.7502 12.5092 10.6134C12.8904 10.4931 13.3 10.4979 13.6784 10.6269C14.1085 10.7735 14.4776 11.1568 15.2157 11.9232L16 12.7126M10.6224 12.1914L14.3828 15.9592M1.04133 14.3876C1.07042 14.6238 1.11996 14.8106 1.20437 14.9763C1.38412 15.329 1.67096 15.6159 2.02377 15.7956C2.42485 16 2.9499 16 4 16H13C13.6134 16 14.0477 16 14.3828 15.9592M1.04133 14.3876C1 14.052 1 13.6164 1 13V4C1 2.94991 1 2.42485 1.20437 2.02377C1.38412 1.67096 1.67096 1.38412 2.02377 1.20437C2.42485 1 2.9499 1 4 1H13C14.0501 1 14.5752 1 14.9763 1.20437C15.329 1.38412 15.6159 1.67096 15.7956 2.02377C16 2.42485 16 2.94991 16 4V12.7126M16 12.7126V13C16 14.0501 16 14.5752 15.7956 14.9763C15.6159 15.329 15.329 15.6159 14.9763 15.7956C14.8095 15.8807 14.6212 15.9303 14.3828 15.9592M13.1875 5.6874C13.1875 6.72297 12.3481 7.56241 11.3125 7.56241C10.2769 7.56241 9.4375 6.72297 9.4375 5.6874C9.4375 4.65186 10.2769 3.8124 11.3125 3.8124C12.3481 3.8124 13.1875 4.65186 13.1875 5.6874Z" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </label>
              <input key={key} id={`file-input-${page}`} style={{ display: 'none' }} type="file" ref={fileInputRef} multiple onChange={handleFileChange}/>
            </>
          }
          <button
            disabled={progress > 0 || (!verifyCorrectSymbols({ message: message }) && files.length === 0)}
            type="submit"
            style={{padding: "0.2rem 0.4rem"}}
          >
            Отправить
          </button>
          {showEmojiPicker && (
          <div className={styles.emoji}>
            <Picker data={emojiData} onEmojiSelect={handleEmojiClick} set="twitter"/>
          </div>
          )}
        </div>
      </form>
      {error && <p>{error}</p>}
    </>
  );
};

export default MessageForm;
