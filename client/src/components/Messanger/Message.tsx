import React, { forwardRef, useState, useEffect, useRef } from "react";
import { IMessage, IFile } from "@/types/user";
import { useAuthStore } from "@/utils/store";
import { getUserFromCookies } from "@/utils/cookies";
import { formateDate } from "@/utils/date";
import UserAvatar from "../UserAvatar";
import PhotoCollage from "../PhotoCollage";
import FileDownload from "./FileDownload";
import FileProvider from "./FileProvider";
import MessageForm from "./MessageForm/MessageForm";
import { socket } from "@/config/socket";
import { mergeRefs } from "react-merge-refs";
import { useRouter } from "next/router";

const Message = forwardRef<HTMLDivElement, IMessage>(({
  _id, author, text, date, files, isEdited, isRead
}, ref) => {
  const { _id: authorId, username } = author;
  const dateString = formateDate(date);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const [profile, setProfile] = useState(user);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [isMessageRead, setIsMessageRead] = useState<boolean>(isRead);
  const [mediaFiles, setMediaFiles] = useState<IFile[]>([]);
  const chatId = router.query.id;

  const renderMessageWithEmojis = (message: string) => {
    return message.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line.split(" ").map((word, wordIndex) => {
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
    if (_id) {
      console.log(_id)
      socket.emit("deleteMessageRequest", {
        messageId: _id,
        chatId: chatId
      });
    }
  };

  useEffect(() => {
    if (!user) {
      setProfile(getUserFromCookies());
    }
  }, [user]);

  useEffect(() => {
    if (files) {
      const filteredFiles = files.filter((file) =>
        file.type.startsWith("video") || file.type.startsWith("image")
      );
      setMediaFiles(filteredFiles);
    }
  }, [files]);

  const messageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const currentNode = messageRef.current; 

    if (currentNode && !isRead) {
      const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          if (user?.id != authorId) {
            setIsMessageRead(true)
          }
        }
      });

      observer.observe(currentNode);

      return () => {
        if (currentNode) {
          observer.unobserve(currentNode);
        }
      };
    }
  }, [messageRef, authorId, user, isRead]);

  useEffect(() => {
    if (isMessageRead && !isRead) {
      socket.emit("readMessageRequest", {
        messageId: _id,
        chatId: chatId
      })
    }
  })

  console.log(editMode)

  return (
    <div ref={mergeRefs([ref, messageRef])}>
      <UserAvatar id={authorId} />
      <p>{username}</p>
      <div>{mediaFiles.length > 0 && <PhotoCollage photos={mediaFiles} />}</div>
      {!editMode ? (
        <p>{renderMessageWithEmojis(text)}</p>
      ) : (
        <MessageForm type="edit" user={user!} value={text} messageId={_id} setEditMode={setEditMode}/>
      )}
      {files?.map((file) => {
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
      {isEdited && <p>ред.</p>}
      <p>{dateString}</p>
      {authorId === profile?.id && (
        <div>
          <button type="button" onClick={() => setEditMode(!editMode)}>
            edit
          </button>
          <button type="button" onClick={handleDeleteMessage}>
            delete
          </button>
        </div>
      )}
      {isRead && user?.id === authorId && <p>проч.</p>}
    </div>
  );
});

Message.displayName = "Message";
export default React.memo(Message);
