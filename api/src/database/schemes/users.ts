import mongoose, { Schema, SchemaTypes } from 'mongoose';
import { IUser } from '../../types/IUser';
import bcrypt from 'bcryptjs';

const userSchema: Schema<IUser> = new Schema<IUser>({
  username: {
    type: String,
    required: true,
  },
  profile: {
    type: String,
    required: false,
    default: null
  },
  tag: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  chatRooms: {
    type: [Schema.Types.ObjectId],
    default: [],
    required: false,
    ref: 'User'
  },
  created_at: {
    type: Date,
    default: () => new Date()
  },
  onlineStatus: {
    type: SchemaTypes.Mixed,
    default: () => new Date(),
    required: false
  }
});

userSchema.pre('save', async function(next) {
  if (this.isModified('password') || this.isNew) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
