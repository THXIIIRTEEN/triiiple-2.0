import mongoose, { Document, Schema } from 'mongoose';

interface IConfirmation extends Document {
  email: string;
  token: string;
  tempData?: string;
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
  tempData: {
    type: String,
    required: false
  }
});

const Confirmation = mongoose.model<IConfirmation>('Confirmation', confirmationSchema);

export default Confirmation;
