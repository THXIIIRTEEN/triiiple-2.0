import { Document } from 'mongoose';
import { IChatRoomSchema } from '../database/schemes/chatRoom';
import { IPostSchema } from '../database/schemes/posts';

export interface IUser extends Document {
  username: string;
  profile: string | null;
  tag: string;
  email: string;
  password: string;
  verified?: boolean;
  chatRooms?: Array<IChatRoomSchema>;
  created_at: Date;
  onlineStatus: Date | boolean;
  posts?: Array<IPostSchema>;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
