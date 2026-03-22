import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStoreLog {
    action: string;
    amount?: number;
    details?: string;
    createdAt: Date;
}

export interface IStores extends Document {
    storeName: string;
    agent: mongoose.Types.ObjectId;      // The agent who owns the store
    totalSales: number;                  // Total volume of sales
    totalProfit: number;                 // Total profit earned by the agent
                   // Store transaction/activity logs
    createdAt: Date;
    updatedAt: Date;
}



const StoresSchema = new Schema<IStores>(
    {
        storeName: { type: String, required: true, unique: true },
        agent: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        totalSales: { type: Number, default: 0 },
        totalProfit: { type: Number, default: 0 },
        
    },
    { timestamps: true }
);

const Stores: Model<IStores> =
    mongoose.models.Stores || mongoose.model<IStores>('Stores', StoresSchema);

export default Stores;
