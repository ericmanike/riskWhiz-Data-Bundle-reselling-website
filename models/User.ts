import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    role: 'user' | 'agent' | 'admin';
    walletBalance: number;
    phone?: string;
    storeName?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, select: false },
        role: { type: String, enum: ['user', 'agent', 'admin'], default: 'user' },
        walletBalance: { type: Number, default: 0.00 },
        phone: { type: String },
        storeName: { type: String, default: '' },
    },
    { timestamps: true }
);

// Prevent overwrite on model compilation
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
