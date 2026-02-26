import mongoose, { Schema, Document, Model } from "mongoose";

export interface IJob extends Document {
    source: string;           // "linkedin" | "indeed" | "company" | "manual"
    url: string;
    title: string;
    company: string;
    companyLogo?: string;
    descriptionRaw?: string;       // HTML/markdown gốc
    descriptionMarkdown: string;
    skills: string[];
    salaryMin?: number;
    salaryMax?: number;
    salaryText?: string;           // "Thỏa thuận", "Competitive"
    location?: string;
    jobType: string;               // "remote" | "onsite" | "hybrid"
    experienceLevel?: string;     // "intern" | "junior" | "mid" | "senior"
    postedAt?: Date;
    scrapedAt: Date;
    embedding?: number[];          // Vector cho semantic search (Atlas / pgvector)
    createdAt: Date;
    updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
    {
        source: { type: String, required: true, default: "manual" },
        url: { type: String, required: true, unique: true },
        title: { type: String, required: true },
        company: { type: String, required: true },
        companyLogo: { type: String },
        descriptionRaw: { type: String },
        descriptionMarkdown: { type: String, required: true },
        skills: { type: [String], default: [] },
        salaryMin: { type: Number },
        salaryMax: { type: Number },
        salaryText: { type: String },
        location: { type: String },
        jobType: { type: String, default: "onsite" },
        experienceLevel: { type: String },
        postedAt: { type: Date },
        scrapedAt: { type: Date, default: Date.now },
        embedding: { type: [Number], select: false }, // không trả về mặc định để giảm payload
    },
    { timestamps: true }
);

JobSchema.index({ scrapedAt: -1 });
JobSchema.index({ source: 1, scrapedAt: -1 });
JobSchema.index({ skills: 1 });

const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema);
export default Job;
