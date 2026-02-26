/**
 * Tầng 3 - Matching: Lấy danh sách việc làm gợi ý cho user (vector + LLM chấm điểm).
 * GET: trả về jobs đã chấm điểm + giải thích; nếu chưa có thì chạy matching và lưu JobMatch.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import Job from "@/models/Job";
import JobMatch from "@/models/JobMatch";
import Resume from "@/models/Resume";
import { getEmbedding, cosineSimilarity } from "@/lib/embedding";
import { scoreJobMatch } from "@/lib/matching/score-job";

export const maxDuration = 60;

function buildResumeSummary(resume: any): string {
  const parts: string[] = [];
  if (resume.personalInfo?.fullName) parts.push(`Họ tên: ${resume.personalInfo.fullName}`);
  if (resume.summary) parts.push(`Tóm tắt: ${resume.summary}`);
  if (resume.skills?.length) parts.push(`Kỹ năng: ${resume.skills.join(", ")}`);
  if (resume.experience?.length) {
    const exp = resume.experience.map((e: any) => `${e.role} tại ${e.company}: ${e.description || ""}`).join(". ");
    parts.push(`Kinh nghiệm: ${exp}`);
  }
  if (resume.education?.length) {
    const edu = resume.education.map((e: any) => `${e.degree} - ${e.school}`).join(". ");
    parts.push(`Học vấn: ${edu}`);
  }
  if (resume.targetDomain) parts.push(`Mục tiêu ngành: ${resume.targetDomain}`);
  return parts.join("\n");
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const resumeId = searchParams.get("resumeId");
    const forceRefresh = searchParams.get("refresh") === "1";

    // Lấy CV của user (resumeId hoặc CV mới nhất)
    let resume: any = null;
    if (resumeId) {
      resume = await Resume.findOne({ _id: resumeId, userId }).lean();
    }
    if (!resume) {
      resume = await Resume.findOne({ userId }).sort({ updatedAt: -1 }).lean();
    }
    if (!resume) {
      return NextResponse.json(
        { error: "Bạn chưa có CV nào. Hãy tạo CV trước để nhận gợi ý việc làm." },
        { status: 400 }
      );
    }

    const rid = resume._id.toString();
    const summary = buildResumeSummary(resume);

    // Đã có kết quả matching lưu sẵn → trả về
    if (!forceRefresh) {
      const existing = await JobMatch.find({ userId, resumeId: rid })
        .sort({ score: -1, matchedAt: -1 })
        .limit(50)
        .populate("jobId")
        .lean();

      if (existing.length > 0) {
        const jobs = existing
          .filter((m: any) => m.jobId)
          .map((m: any) => {
            const j = m.jobId && typeof m.jobId === "object" ? m.jobId : {};
            return {
              ...j,
              matchScore: m.score,
              matchExplanation: m.explanation,
              matchedAt: m.matchedAt,
            };
          });
        return NextResponse.json({ jobs, fromCache: true });
      }
    }

    // Lấy jobs có embedding (để vector search)
    const jobsWithEmbedding = await Job.find({
      embedding: { $exists: true, $ne: [] },
    })
      .select("+embedding")
      .sort({ scrapedAt: -1 })
      .limit(200)
      .lean();

    let candidateJobs = jobsWithEmbedding as any[];

    if (candidateJobs.length > 0) {
      const resumeEmbedding = await getEmbedding(summary);
      candidateJobs = candidateJobs
        .map((j) => ({
          ...j,
          _similarity: cosineSimilarity(resumeEmbedding, j.embedding || []),
        }))
        .sort((a, b) => (b._similarity || 0) - (a._similarity || 0))
        .slice(0, 50);
    } else {
      // Không có embedding → lấy 50 job mới nhất, match bằng LLM
      candidateJobs = await Job.find({})
        .sort({ scrapedAt: -1 })
        .limit(50)
        .lean();
    }

    const results: Array<{
      job: any;
      score: number;
      explanation: string;
    }> = [];

    for (let i = 0; i < Math.min(candidateJobs.length, 20); i++) {
      const job = candidateJobs[i];
      const jobId = job._id.toString();
      const existingMatch = await JobMatch.findOne({ userId, jobId }).lean();
      if (existingMatch) {
        results.push({
          job,
          score: existingMatch.score,
          explanation: existingMatch.explanation || "",
        });
        continue;
      }

      try {
        const { score, explanation } = await scoreJobMatch(
          summary,
          job.title,
          job.company,
          job.descriptionMarkdown || "",
          job.skills || []
        );

        await JobMatch.findOneAndUpdate(
          { userId, jobId },
          {
            userId,
            resumeId: rid,
            jobId: job._id,
            score,
            explanation,
            matchedAt: new Date(),
          },
          { upsert: true, new: true }
        );

        results.push({ job, score, explanation });
      } catch (err) {
        console.error("Score job error:", job.title, err);
      }
    }

    results.sort((a, b) => b.score - a.score);

    const jobs = results.map((r) => {
      const { embedding: _, _similarity: __, ...rest } = r.job;
      return {
        ...rest,
        matchScore: r.score,
        matchExplanation: r.explanation,
      };
    });

    return NextResponse.json({ jobs, fromCache: false });
  } catch (error: any) {
    console.error("Jobs recommended error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
