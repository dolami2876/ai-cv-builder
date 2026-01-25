// models/Resume.ts
import mongoose, { Schema, Document, Model } from "mongoose";

// Định nghĩa kiểu dữ liệu (Interface) cho TypeScript
export interface IResume extends Document {
    userId: string;       // ID người dùng (sau này dùng Clerk/NextAuth)
    title: string;        // Tên file CV
    isPublished: boolean; // Trạng thái public hay private
    personalInfo: {
        fullName: string;
        email: string;
        phone: string;
        linkedin?: string;  // Dấu ? nghĩa là không bắt buộc
        portfolio?: string;
    };
    summary: string;
    experience: {
        company: string;
        role: string;
        startDate: string;
        endDate: string;
        description: string;
    }[];
    education: {
        school: string;
        degree: string;
        startDate: string;
        endDate: string;
    }[];
    skills: string[]; // Mảng string cho kỹ năng

    // Onboarding / Persona Data (Dùng cho AI Context)
    targetDomain?: string;     // Ngành mong muốn (e.g. "Software Engineer")
    experienceLevel?: string;  // Trình độ (e.g. "Senior", "Fresher")
    jobGoal?: string;          // Mục tiêu (e.g. "Full-time", "Remote")

    style?: {
        hexColor: string;
        font: string;
        layout: string;
    };
    createdAt?: Date;
    updatedAt?: Date;
}

// Định nghĩa Schema cho Mongoose
const ResumeSchema = new Schema<IResume>(
    {
        userId: { type: String, required: true },
        title: { type: String, required: true, default: "Untitled Resume" },
        isPublished: { type: Boolean, default: false },

        personalInfo: {
            fullName: { type: String, default: "" },
            email: { type: String, default: "" },
            phone: { type: String, default: "" },
            linkedin: { type: String, default: "" },
            portfolio: { type: String, default: "" },
        },
        summary: { type: String, default: "" },

        experience: [
            {
                company: { type: String, default: "" },
                role: { type: String, default: "" },
                startDate: { type: String, default: "" },
                endDate: { type: String, default: "" },
                description: { type: String, default: "" },
            }
        ],
        education: [
            {
                school: { type: String, default: "" },
                degree: { type: String, default: "" },
                startDate: { type: String, default: "" },
                endDate: { type: String, default: "" },
            }
        ],
        skills: { type: [String], default: [] },

        // Onboarding / Persona Data
        targetDomain: { type: String, default: "" },
        experienceLevel: { type: String, default: "" },
        jobGoal: { type: String, default: "" },

        // Visual Preferences
        style: {
            hexColor: { type: String, default: "#000000" }, // Accent Color
            font: { type: String, default: "inter" },
            layout: { type: String, default: "modern" }, // modern, classic, minimal
        },
    },
    { timestamps: true }
);

// Logic để tránh lỗi "OverwriteModelError" trong Next.js
const Resume: Model<IResume> = mongoose.models.Resume || mongoose.model<IResume>("Resume", ResumeSchema);

export default Resume;