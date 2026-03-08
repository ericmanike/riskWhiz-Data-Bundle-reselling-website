import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWithdrawal extends Document {
    agentId: mongoose.Types.ObjectId;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    paymentMethod: string;
    details: string; // e.g. momo number
    createdAt: Date;
    updatedAt: Date;
}

const WithdrawalSchema = new Schema<IWithdrawal>(
    {
        agentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        amount: { type: Number, required: true },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        paymentMethod: { type: String, required: true },
        details: { type: String, required: true },
    },
    { timestamps: true }
);

const Withdrawal: Model<IWithdrawal> = mongoose.models.Withdrawal || mongoose.model<IWithdrawal>('Withdrawal', WithdrawalSchema);

export default Withdrawal;
