import mongoose, { Schema } from 'mongoose';

export interface IPostSchema {
    _id?: string,
    groupId: Schema.Types.ObjectId,
    author: Schema.Types.ObjectId,
    text: string,
    date: Date,
    files: Schema.Types.ObjectId[] | [],
    readCount: Schema.Types.ObjectId[] | [],
    likes: Schema.Types.ObjectId[] | [],
    comments: Schema.Types.ObjectId[] | []
}

const postSchema: Schema<IPostSchema> = new Schema<IPostSchema>({
    groupId: {
        type: Schema.Types.ObjectId,
        required: false,
        ref: 'User'
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
    readCount: {
        type: [Schema.Types.ObjectId],
        required: false,
        default: [],
        ref: 'User'
    },
    likes: {
        type: [Schema.Types.ObjectId],
        required: false,
        default: [],
        ref: 'User'
    },
    comments: {
        type: [Schema.Types.ObjectId],
        required: false,
        default: [],
        ref: 'Comment'
    },
});

const Post = mongoose.model('Post', postSchema);

export default Post;
