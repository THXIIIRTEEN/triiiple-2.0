import mongoose, { Schema } from 'mongoose';

export interface INotificationSchema {
    _id?: string,
    chatId: Schema.Types.ObjectId,
    author: Schema.Types.ObjectId,
    text: string,
    date: Date,
    files: number,
    type: string,
    isRead: boolean,
}

const notificationsSchema: Schema<INotificationSchema> = new Schema<INotificationSchema>({
    chatId: {
        type: Schema.Types.ObjectId,
        required: false,
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
        type: Number,
        required: false,
        default: 0,
        ref: 'File'
    },
    type: {
        type: String,
        required: false,
        default: 'message'
    },
    isRead: {
        type: Boolean,
        required: false,
        default: false
    }
});

const Notifications = mongoose.model('Notifications', notificationsSchema);

export default Notifications;
