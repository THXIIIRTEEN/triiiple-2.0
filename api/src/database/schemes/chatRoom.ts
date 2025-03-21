import mongoose, { Schema } from 'mongoose';
import { IMessageSchema } from './message';

export interface IChatRoomSchema {
    members: Array<Schema.Types.ObjectId>,
    messages: Array<Schema.Types.ObjectId | IMessageSchema>
}

const chatRoomSchema: Schema<IChatRoomSchema> = new Schema<IChatRoomSchema>({
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    messages: [{
        type: Schema.Types.ObjectId,
        ref: 'Message',
        default: []
    }]
});
const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);

export default ChatRoom;