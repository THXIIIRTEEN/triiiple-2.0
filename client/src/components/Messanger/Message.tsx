import { IMessage } from "@/types/user";
import UserAvatar from "../UserAvatar";
import { formateDate } from "@/utils/date";
import React from "react";

const Message: React.FC<IMessage> = ({ author, text, date }) => {
  const { _id, username } = author;
  const dateString = formateDate(date);

  const renderMessageWithEmojis = (message: string) => {
    return message.split(" ").map((word, index) => {
      if (word.startsWith(":") && word.endsWith(":")) {
        const shortcodes = word
        return (
          <em-emoji
            key={index}
            shortcodes={shortcodes} 
            size="1.25em"
            set="twitter" 
          />
        );
      }
      return <span key={index}>{word} </span>;
    });
  };

  return (
    <div>
      <UserAvatar id={_id} />
      <p>{username}</p>
      <p>{renderMessageWithEmojis(text)}</p>
      <p>{dateString}</p>
    </div>
  );
};

export default React.memo(Message);
