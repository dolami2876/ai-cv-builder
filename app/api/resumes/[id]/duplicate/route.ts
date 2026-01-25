import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Resume from "@/models/Resume";
import connectToDB from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;
        await connectToDB();

        const originalResume = await Resume.findOne({ _id: id, userId });

        if (!originalResume) {
            return new NextResponse("Resume not found", { status: 404 });
        }

        // Clone the resume object
        const newResumeData = originalResume.toObject() as any;
        delete newResumeData._id; // Remove original ID
        delete newResumeData.createdAt;
        delete newResumeData.updatedAt;

        newResumeData.title = `${newResumeData.title} (Copy)`;
        newResumeData.isPublished = false;

        const newResume = await Resume.create(newResumeData);

        return NextResponse.json(newResume);
    } catch (error) {
        console.error("Duplicate Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
