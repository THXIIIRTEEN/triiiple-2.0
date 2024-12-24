import { IUser } from "@/types/user";
import { useState } from "react";
import { useRouter } from "next/router";
import { socket } from "@/config/socket";
import { verifyCorrectSymbols } from "@/utils/textValidation";
import emojiData from "@emoji-mart/data/sets/15/all.json";
import Picker from "@emoji-mart/react";

interface IMessageForm {
  user: IUser | null;
}

const MessageForm: React.FC<IMessageForm> = ({ user }) => {
  const router = useRouter();

  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const chatId = router.query.id;

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiClick = (emoji: { native: string; shortcodes: string }) => {
    setMessage((prevMessage) => prevMessage + " " + emoji.shortcodes); 
  };

  const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (user && user.id) {
      if (verifyCorrectSymbols({ message: message }, setError)) {
        socket.emit("sendMessage", {
          author: user.id,
          chatId: chatId,
          text: message,
        });
        setMessage(""); 
        setError(null);
      }
    }
  };

  return (
    <>
      <form onSubmit={(event) => sendMessage(event)}>
        <textarea
          onChange={(event) => setMessage(event.target.value)}
          value={message}
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
