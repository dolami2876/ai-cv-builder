import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
    clerkId: string;
    email: string;
    credits: number;
    lastFreeCreditReset: Date;
    isPremium: boolean;
    paymentHistory: {
        transactionId: string;
        amount: number;
        date: Date;
        status: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        clerkId: { type: String, required: true, unique: true, index: true },
        email: { type: String, required: true },
        credits: { type: Number, default: 50 }, // Free 50 credits
        lastFreeCreditReset: { type: Date, default: Date.now },
        isPremium: { type: Boolean, default: false },
        paymentHistory: [
            {
                transactionId: String,
                amount: Number,
                date: { type: Date, default: Date.now },
                status: String,
            },
        ],
    },
    { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
