import mongoose, { Schema } from 'mongoose';

export interface IMessageSchema {
    author: Schema.Types.ObjectId,
    text: String,
    date: Date,
    isEdited: Boolean
}

const messageSchema: Schema<IMessageSchema> = new Schema<IMessageSchema>({
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
        default: new Date()
    },
    isEdited: {
        type: Boolean,
        required: false,
        default: false
    }
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
