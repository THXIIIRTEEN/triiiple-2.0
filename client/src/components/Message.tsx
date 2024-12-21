import { IMessage } from "@/types/user";
import UserAvatar from "./UserAvatar";
import { formateDate } from "@/utils/date";
import React from "react";

const Message: React.FC<IMessage> = ({ author, text, date }) => {

    const { _id, username } = author;
    const dateString = formateDate(date);

    return (
        <>
            <div>
                <UserAvatar id={_id}/>
                <p>{username}</p>
                <p>{text}</p>
                <p>{dateString}</p>
            </div>
        </>
    );
}

export default React.memo(Message)