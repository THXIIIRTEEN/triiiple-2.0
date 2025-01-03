export interface IUser {
    _id?: string;
    id?: string;
    email?: string;
    username?: string;
    password?: string;
    tag?: string;
}

export interface IMessage {
    _id: string;
    author: IUser;
    text: string;
    date: Date;
    isEdited: boolean
}