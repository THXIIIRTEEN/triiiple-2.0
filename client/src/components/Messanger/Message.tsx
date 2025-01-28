import React, { useEffect, useState } from "react";
import { IFile, IMessage } from "@/types/user";
import UserAvatar from "../UserAvatar";
import { formateDate } from "@/utils/date";
import { useAuthStore } from "@/utils/store";
import { getUserFromCookies } from "@/utils/cookies";
import { useRouter } from "next/router";
import { socket } from "@/config/socket";
import MessageForm from "./MessageForm";
import PhotoCollage from "../PhotoCollage";
import FileDownload from "./FileDownload";
import FileProvider from "./FileProvider";

const Message: React.FC<IMessage> = ({
  _id,
  author,
  text,
  date,
  files,
  isEdited,
}) => {
  const { _id: authorId, username } = author;
  const dateString = formateDate(date);
  const user = useAuthStore((state) => state.user);

  const [profile, setProfile] = useState(user);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [ mediaFiles, setMediaFiles ] = useState<IFile[]>([])

  const router = useRouter();
  const chatId = router.query.id;

  useEffect(() => {
    if (!user) {
      setProfile(getUserFromCookies());
    }
  }, [user]);

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
    if (_id && chatId) {
      socket.emit("deleteMessageRequest", {
        messageId: _id,
        chatId: chatId,
      });
    }
  };

  useEffect(() => {
    if (chatId) {
      socket.on("editMessageResponse", () => {
        setEditMode(false);
      });

      return () => {
        socket.off("editMessageResponse");
      };
    }
  }, [chatId]);

  useEffect(() => {
    if (files) {
      const filteredFiles = files.filter((file) => {
        return file.type.startsWith('video') || file.type.startsWith('image')
      });
      if (filteredFiles) {
        setMediaFiles(filteredFiles);
      }
    }
  }, [files])

  return (
    <div>
      <UserAvatar id={authorId} />
      <p>{username}</p>
      <div>
        {mediaFiles && <PhotoCollage photos={mediaFiles} />}
      </div>
      {!editMode ? (
        <p>{renderMessageWithEmojis(text)}</p>
      ) : (
        <MessageForm type="edit" user={user} value={text} messageId={_id} />
      )}
      {files?.map(
        (file) =>
          file.type.split("/")[0] !== "image" &&
          file.type.split("/")[0] !== "video" && (
            <FileProvider key={file._id} file={file}>
              {(signedUrl: string) => {
                if (!signedUrl) {
                  return <div>Loading...</div>;
                }
                return <FileDownload file={file} signedUrl={signedUrl} />;
              }}
            </FileProvider>
          )
      )}
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
    </div>
  );
};

export default React.memo(Message);
