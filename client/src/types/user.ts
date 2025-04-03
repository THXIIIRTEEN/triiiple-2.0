import { LegacyRef } from "react";

export interface IUser {
    _id?: string;
    id: string;
    email?: string;
    username?: string;
    password?: string;
    tag?: string;
}

export interface IFile {
    _id?: string;
    name: string;
    url: string;
    type: string
}

export interface IMessage {
    _id: string;
    author: IUser;
    text: string;
    date: Date;
    files?: IFile[];
    isEdited: boolean;
    isRead: boolean
    ref: LegacyRef<HTMLDivElement | null>
}

export interface IPost {
    _id: string;
    groupId: IUser;
    author: IUser;
    text: string;
    date: Date;
    files?: IFile[];
    readCount: number;
    likes: number;
    comments: [] | IUser[] | boolean;
    isLiked: boolean;
    isRead: boolean
}
