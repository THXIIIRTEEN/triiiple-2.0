import { IMessage } from "@/types/user";
import UserAvatar from "../UserAvatar";
import { formateDate } from "@/utils/date";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/utils/store";
import { getUserFromCookies } from "@/utils/cookies";
import { useRouter } from "next/router";
import { socket } from "@/config/socket";
import MessageForm from "./MessageForm";
import Image from "next/image";
import ReactPlayer from 'react-player';

const Message: React.FC<IMessage> = ({ _id, author, text, date, files, isEdited }) => {
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
      <div>
        { files?.map((file) => (
          file.type.split("/")[0] === 'video' &&
          // <video key={file._id} controls width="600">
          //   <source src={file.url} type={file.type} />
          //   Ваш браузер не поддерживает видео.
          // </video>
          <ReactPlayer controls key={file._id} url={file.url} width='200px' height='auto' />
        ))}
        { files?.map((file) => (
          file.type.split("/")[0] === 'image' &&
          <Image width={200} height={200} key={file._id} src={file.url} alt={'image'}/>
        ))}
      </div>
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
