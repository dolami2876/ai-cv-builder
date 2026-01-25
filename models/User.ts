import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
    clerkId: string;
    email: string;
    isPremium: boolean;
    credits: number;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        clerkId: { type: String, required: true, unique: true },
        email: { type: String, required: true },
        isPremium: { type: Boolean, default: false },
        credits: { type: Number, default: 5 }, // Free 5 credits
    },
    { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
