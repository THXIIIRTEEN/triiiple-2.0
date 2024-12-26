import { IMessage } from "@/types/user";
import UserAvatar from "../UserAvatar";
import { formateDate } from "@/utils/date";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/utils/store";
import { getUserFromCookies } from "@/utils/cookies";
import { useRouter } from "next/router";
import { socket } from "@/config/socket";
import MessageForm from "./MessageForm";

const Message: React.FC<IMessage> = ({ _id, author, text, date, isEdited }) => {
  const { _id: authorId, username } = author;
  const dateString = formateDate(date);
  const user = useAuthStore(state => state.user);

  const [ profile, setProfile ] = useState(user);    
  const [ editMode, setEditMode ] = useState<boolean>(false)

  const router = useRouter();
  const chatId = router.query.id;

  useEffect(() => {
      if (!user) {
          setProfile(getUserFromCookies())
      }
  }, [user]);

  const renderMessageWithEmojis = (message: string) => {
    return message.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line.split(' ').map((word, wordIndex) => {
          if (word.startsWith(":") && word.endsWith(":")) {
            return (
              <em-emoji
                key={wordIndex}
                shortcodes={word}
                size="1.25em"
                set="twitter"
              />
            );
          }
          return <span key={wordIndex}>{word} </span>;
        })}
        <br />
      </React.Fragment>
    ));
  };

  const handleDeleteMessage = async () => {
      if (_id && chatId) {
        socket.emit("deleteMessageRequest", {
          messageId: _id,
          chatId: chatId,
        });
      }
  }

  useEffect(() => {
    if (chatId) {
        socket.on('editMessageResponse', () => {
          setEditMode(false)
        });

        return () => {
          socket.off('editMessageResponse');
        };
    }
}, [chatId]);

  return (
    <div>
      <UserAvatar id={authorId} />
      <p>{username}</p>
      { !editMode ?
        <p>{renderMessageWithEmojis(text)}</p>
        :
        <MessageForm type="edit" user={user} value={text} messageId={_id}/>
      }
      { isEdited &&
        <p>ред.</p>
      }
      <p>{dateString}</p>

      { authorId === profile?.id &&
        <div>
          <button type="button" onClick={() => setEditMode(!editMode)}>edit</button>
          <button type="button" onClick={handleDeleteMessage}>delete</button>
        </div>
      }
    </div>
  );
};

export default React.memo(Message);
