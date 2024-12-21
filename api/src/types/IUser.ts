import { Document } from 'mongoose';
import { IChatRoomSchema } from '../database/schemes/chatRoom';

export interface IUser extends Document {
  username: string;
  profile: string | null;
  tag: string;
  email: string;
  password: string;
  verified?: boolean;
  chatRooms?: Array<IChatRoomSchema>
  comparePassword(candidatePassword: string): Promise<boolean>;
}
