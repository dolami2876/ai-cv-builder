import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import Resume from "@/models/Resume";

export async function GET(
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
        const resume = await Resume.findOne({ _id: id, userId });

        if (!resume) {
            return NextResponse.json({ error: "Resume not found" }, { status: 404 });
        }

        return NextResponse.json(resume);
    } catch (error) {
        console.error("Error fetching resume:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(
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
        const body = await req.json();

        // Update verify ownership
        const updatedResume = await Resume.findOneAndUpdate(
            { _id: id, userId },
            { ...body },
            { new: true, runValidators: true }
        );

        if (!updatedResume) {
            return NextResponse.json({ error: "Resume not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json(updatedResume);
    } catch (error) {
        console.error("Error updating resume:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
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

        const deletedResume = await Resume.findOneAndDelete({ _id: id, userId });

        if (!deletedResume) {
            return NextResponse.json({ error: "Resume not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json({ message: "Resume deleted successfully" });
    } catch (error) {
        console.error("Error deleting resume:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
