import mongoose, { Schema } from 'mongoose';

export interface IMessageSchema {
    _id?: string,
    chatId: Schema.Types.ObjectId,
    author: Schema.Types.ObjectId,
    text: string,
    date: Date,
    files: Schema.Types.ObjectId[] | [],
    isEdited: Boolean,
    isRead: Boolean
}

const messageSchema: Schema<IMessageSchema> = new Schema<IMessageSchema>({
    chatId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'ChatRoom'
    },
    author: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    text: {
        type: String,
        required: false,
        default: null
    },
    date: {
        type: Date,
        required: true,
        default: () => new Date()
    },
    files: {
        type: [Schema.Types.ObjectId],
        required: false,
        default: [],
        ref: 'File'
    },
    isEdited: {
        type: Boolean,
        required: false,
        default: false
    },
    isRead: {
        type: Boolean,
        required: false,
        default: false
    }
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
