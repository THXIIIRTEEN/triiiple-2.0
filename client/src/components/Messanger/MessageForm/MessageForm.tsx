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
import styles from "./message-form.module.css"

interface IMessageForm {
  type: string;
  user: IUser;
  value?: string;
  messageId?: string;
  page?: 'News' | 'Chat' | 'Comment' | 'AboutUser';
  postId?: string;
  setEditMode?: React.Dispatch<React.SetStateAction<boolean>>
}

const MessageForm: React.FC<IMessageForm> = ({ type, user, value, messageId, setEditMode, page, postId }) => {
  const router = useRouter();

  const [ message, setMessage ] = useState<string>(value ? value : "");
  const [ error, setError ] = useState<string | null>(null);
  const [ showEmojiPicker, setShowEmojiPicker ] = useState<boolean>(false);
  const [ cursorPosition, setCursorPosition ] = useState<number | null>(null);
  const [ files, setFiles ] = useState<(File)[]>([]);
  const [ progress, setProgress ] = useState<number>(0);
  const [ placeholder, setPlaceholder ] = useState<string>('')
  

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

  return (
    <>
      <form onSubmit={type === "send" ? (event) => sendMessage(event) : (event) => editMessage(event)}>
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
        { currentPage !== "AboutUser" &&
          <input type="file" ref={fileInputRef} multiple onChange={handleFileChange}/>
        }
        <textarea
          onChange={(event) => setMessage(event.target.value)}
          value={message}
          rows={4}
          style={{ whiteSpace: 'pre-wrap' }}
          ref={textareaRef}
          placeholder={placeholder}
        ></textarea>

        <button type="button" onClick={toggleEmojiPicker}>
          emoji
        </button>
        <button
          disabled={progress > 0 || (!verifyCorrectSymbols({ message: message }) && files.length === 0)}
          type="submit"
        >
          Ok
        </button>
        {showEmojiPicker && (
          <Picker data={emojiData} onEmojiSelect={handleEmojiClick} set="twitter" />
        )}
      </form>
      {error && <p>{error}</p>}
    </>
  );
};

export default MessageForm;
