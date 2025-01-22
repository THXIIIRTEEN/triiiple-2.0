import mongoose, { Schema } from 'mongoose';

export interface IFileSchema {
    _id: Schema.Types.ObjectId,
    name: string,
    url: string,
    type: string
}

const fileSchema: Schema<IFileSchema> = new Schema<IFileSchema>({
    name: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true
    }
});

const File = mongoose.model('File', fileSchema);

export default File;
