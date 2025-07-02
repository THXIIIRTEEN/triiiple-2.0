import { Document, Schema } from 'mongoose';
import { IChatRoomSchema } from '../database/schemes/chatRoom';
import { IPostSchema } from '../database/schemes/posts';

export interface IUser extends Document {
  username: string;
  profile: string | null;
  tag: string;
  email: string;
  password: string;
  about_user: string;
  verified?: boolean;
  chatRooms?: Array<IChatRoomSchema>;
  created_at: Date;
  onlineStatus: Date | boolean;
  posts?: Array<IPostSchema>;
  friends?: Array<string | IUser>; 
  requests?: Array<string | IUser>;
  friendStatus?: boolean | "pending";
  notifications?: Array<any>;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
