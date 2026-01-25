import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import Resume from "@/models/Resume";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const body = await req.json();

        const newResume = await Resume.create({
            userId,
            title: body.title || "My Resume",
            ...body,
        });

        return NextResponse.json(newResume, { status: 201 });
    } catch (error) {
        console.error("Error creating resume:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // Find resumes belonging to this user, sorted by newest first
        const resumes = await Resume.find({ userId }).sort({ updatedAt: -1 });

        return NextResponse.json(resumes);
    } catch (error) {
        console.error("Error fetching resumes:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
