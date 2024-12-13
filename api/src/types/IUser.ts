import { Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  profile: string | null;
  tag: string;
  email: string;
  password: string;
  verified?: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
