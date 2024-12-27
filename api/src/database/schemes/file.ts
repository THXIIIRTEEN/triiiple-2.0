import mongoose, { Schema } from 'mongoose';

export interface IFileSchema {
    name: String,
    url: String,
}

const fileSchema: Schema<IFileSchema> = new Schema<IFileSchema>({
    name: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    }
});

const File = mongoose.model('File', fileSchema);

export default File;
