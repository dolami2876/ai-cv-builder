import mongoose, { Schema, Document, Model } from "mongoose";

export interface IJobMatch extends Document {
    userId: string;          // Clerk user id
    resumeId: string;        // Resume được dùng để match
    jobId: mongoose.Types.ObjectId;
    score: number;           // 1-100
    explanation: string;     // "Tại sao việc này phù hợp với bạn?"
    matchedAt: Date;
    notified?: boolean;      // Đã gửi email/thông báo chưa
}

const JobMatchSchema = new Schema<IJobMatch>(
    {
        userId: { type: String, required: true },
        resumeId: { type: String, required: true },
        jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
        score: { type: Number, required: true },
        explanation: { type: String, default: "" },
        matchedAt: { type: Date, default: Date.now },
        notified: { type: Boolean, default: false },
    },
    { timestamps: true }
);

JobMatchSchema.index({ userId: 1, jobId: 1 }, { unique: true });
JobMatchSchema.index({ userId: 1, matchedAt: -1 });

const JobMatch: Model<IJobMatch> = mongoose.models.JobMatch || mongoose.model<IJobMatch>("JobMatch", JobMatchSchema);
export default JobMatch;
