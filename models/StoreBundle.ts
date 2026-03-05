import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStoreBundle extends Document {
    agent: mongoose.Types.ObjectId;      // The agent who owns the store
    bundle: mongoose.Types.ObjectId;     // The original Bundle ref
    customPrice?: number;                // Optional override price
    isVisible: boolean;                  // Can be hidden from store without removing
    createdAt: Date;
    updatedAt: Date;
}

const StoreBundleSchema = new Schema<IStoreBundle>(
    {
        agent: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        bundle: { type: Schema.Types.ObjectId, ref: 'Bundle', required: true },
        customPrice: { type: Number },
        isVisible: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// Ensure an agent can only add a bundle once
StoreBundleSchema.index({ agent: 1, bundle: 1 }, { unique: true });

const StoreBundle: Model<IStoreBundle> =
    mongoose.models.StoreBundle || mongoose.model<IStoreBundle>('StoreBundle', StoreBundleSchema);

export default StoreBundle;
