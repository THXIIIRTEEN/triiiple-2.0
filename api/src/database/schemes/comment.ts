import mongoose, { Schema } from 'mongoose';

export interface ICommentSchema {
    _id?: string,
    postId: Schema.Types.ObjectId,
    author: Schema.Types.ObjectId,
    text: string,
    date: Date,
    files: Schema.Types.ObjectId[] | [],
    isEdited: Boolean,
    isRead: Boolean
}

const commentSchema: Schema<ICommentSchema> = new Schema<ICommentSchema>({
    postId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Post'
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
    }
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
