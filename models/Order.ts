import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrder extends Document {
    user: mongoose.Types.ObjectId;
    transaction_id: string;
    bundleName: string;
    network: string;
    price: number;
    phoneNumber: string;

    status: 'pending' | 'delivered' | 'failed' | 'reversed';
    transactionId?: string; // External or generated ID
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        transaction_id: { type: String, required: true },
        bundleName: { type: String, required: true },
        network: { type: String, required: true },
        price: { type: Number, required: true },
        phoneNumber: { type: String, required: true },
        status: {
            type: String,
            enum: ['pending', 'delivered', 'failed', 'reversed'],
            default: 'pending'
        },
        transactionId: { type: String },
    },
    { timestamps: true }
);

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
