"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  MapPin,
  ExternalLink,
  DollarSign,
} from "lucide-react";

export default function JobDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/jobs/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setJob)
      .catch(() => setJob(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="h-64 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl text-center">
        <p className="text-gray-500">Không tìm thấy tin tuyển dụng.</p>
        <Link href="/jobs" className="mt-4 inline-block text-emerald-600 hover:underline">
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Tin tuyển dụng
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
          <span className="flex items-center gap-1">
            <Building2 className="h-5 w-5" /> {job.company}
          </span>
          {job.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-5 w-5" /> {job.location}
            </span>
          )}
          <span className="px-2 py-1 rounded bg-gray-100 text-gray-700">
            {job.jobType || "onsite"}
          </span>
          {job.experienceLevel && (
            <span className="text-sm text-gray-500">{job.experienceLevel}</span>
          )}
        </div>

        {(job.salaryMin != null || job.salaryMax != null || job.salaryText) && (
          <div className="flex items-center gap-2 text-gray-700 mb-4">
            <DollarSign className="h-5 w-5" />
            {job.salaryMin != null || job.salaryMax != null
              ? `${job.salaryMin ?? "?"} - ${job.salaryMax ?? "?"} (triệu)`
              : job.salaryText}
          </div>
        )}

        {job.skills?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Kỹ năng</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((s: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-sm"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Mô tả công việc</h3>
          <pre className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap font-sans">
            {job.descriptionMarkdown || "—"}
          </pre>
        </div>

        {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Ứng tuyển / Xem gốc <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  );
}
