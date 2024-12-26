import { IUser } from "@/types/user";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { socket } from "@/config/socket";
import { verifyCorrectSymbols } from "@/utils/textValidation";
import emojiData from "@emoji-mart/data/sets/15/all.json";
import Picker from "@emoji-mart/react";
import FilePreview from "./FilePreview/FilePreview";
import FilePreviewScroll from "./FilePreview/FilePreviewScroll";

interface IMessageForm {
  type: string;
  user: IUser | null;
  value?: string;
  messageId?: string
}

const MessageForm: React.FC<IMessageForm> = ({ type, user, value, messageId }) => {
  const router = useRouter();

  const [ message, setMessage ] = useState<string>(value ? value : "");
  const [ error, setError ] = useState<string | null>(null);
  const [ showEmojiPicker, setShowEmojiPicker ] = useState<boolean>(false);
  const [ cursorPosition, setCursorPosition ] = useState<number | null>(null);
  const [ files, setFiles ] = useState<(File)[]>([])
  const chatId = router.query.id;

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (user && user.id) {
      if (verifyCorrectSymbols({ message: message }, setError)) {
        socket.emit("sendMessageRequest", {
          author: user.id,
          chatId: chatId,
          text: message,
        });
        setMessage(""); 
        setError(null);
      }
    }
  };

  const editMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (user && user.id) {
      if (verifyCorrectSymbols({ message: message }, setError)) {
        socket.emit("editMessageRequest", {
          messageId: messageId,
          text: message,
          chatId: chatId,
          isEdited: true
        });
        setMessage(""); 
        setError(null);
      }
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      console.log(files)
    }
  }

  return (
    <>
      <form onSubmit={type === "send" ? (event) => sendMessage(event) : (event) => editMessage(event)}>
        { files.length > 0 &&
          <FilePreviewScroll>
            {files.map((file, index) => (
              <FilePreview key={index} file={file}/>
            ))}
          </FilePreviewScroll>
        }
        <input type="file" multiple onChange={handleFileChange}/>
        <textarea
          onChange={(event) => setMessage(event.target.value)}
          value={message}
          rows={4}
          style={{ whiteSpace: 'pre-wrap' }}
          ref={textareaRef}
        ></textarea>
        <button type="button" onClick={toggleEmojiPicker}>
          emoji
        </button>
        <button
          disabled={!verifyCorrectSymbols({ message: message })}
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
