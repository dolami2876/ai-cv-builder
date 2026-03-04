import mongoose, { Schema, Document, Model } from "mongoose";

export type JobSourceType = "rss" | "links";

export interface IJobSource extends Document {
  name: string;
  type: JobSourceType;
  url: string; // RSS feed URL or a page containing job links
  enabled: boolean;
  notes?: string;
  lastRunAt?: Date;
  lastSuccessAt?: Date;
  lastError?: string;
  createdAt: Date;
  updatedAt: Date;
}

const JobSourceSchema = new Schema<IJobSource>(
  {
    name: { type: String, required: true },
    type: { type: String, required: true, enum: ["rss", "links"] },
    url: { type: String, required: true, unique: true, index: true },
    enabled: { type: Boolean, default: true },
    notes: { type: String, default: "" },
    lastRunAt: { type: Date },
    lastSuccessAt: { type: Date },
    lastError: { type: String, default: "" },
  },
  { timestamps: true }
);

JobSourceSchema.index({ enabled: 1, updatedAt: -1 });

const JobSource: Model<IJobSource> =
  mongoose.models.JobSource || mongoose.model<IJobSource>("JobSource", JobSourceSchema);

export default JobSource;

