import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import Resume from "@/models/Resume";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const { id } = await params;

        // Find original resume
        const originalResume = await Resume.findOne({ _id: id, userId });
        if (!originalResume) {
            return NextResponse.json({ error: "Resume not found" }, { status: 404 });
        }

        // Clone fields
        const { _id, createdAt, updatedAt, __v, ...resumeData } = originalResume.toObject();

        // Create new resume with modified title
        const newResume = await Resume.create({
            ...resumeData,
            title: `Copy of ${originalResume.title}`,
            userId, // Explicitly set again
        });

        return NextResponse.json(newResume, { status: 201 });

    } catch (error) {
        console.error("Error duplicating resume:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
