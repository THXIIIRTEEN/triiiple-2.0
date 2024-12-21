import mongoose, { Schema } from 'mongoose';

export interface IChatRoomSchema {
    members: Array<Schema.Types.ObjectId>,
    messages: Array<Schema.Types.ObjectId>
}

const chatRoomSchema: Schema<IChatRoomSchema> = new Schema<IChatRoomSchema>({
    members: {
        type: [Schema.Types.ObjectId],
        required: true,
        ref: 'User'
    },
    messages: {
        type: [Schema.Types.ObjectId],
        required: false,
        default: [],
        ref: 'Message'
    }
});

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);

export default ChatRoom;
