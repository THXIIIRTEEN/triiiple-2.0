import mongoose, { Document, Schema } from 'mongoose';

interface IVerification extends Document {
  email: string;
  code: string;
  createdAt: Date;
}

const verificationSchema: Schema<IVerification> = new Schema({
  email: { type: String, required: true },
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: '1h' },
});

const Verification = mongoose.model<IVerification>('Verification', verificationSchema);

export default Verification;
