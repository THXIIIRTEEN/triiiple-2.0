import mongoose, { Document, Schema } from 'mongoose';

interface IConfirmation extends Document {
  email: string;
  token: string;
}

const confirmationSchema: Schema<IConfirmation> = new Schema({
  email: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
});

const Confirmation = mongoose.model<IConfirmation>('Confirmation', confirmationSchema);

export default Confirmation;
