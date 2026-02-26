"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, Building2, ArrowLeft, ExternalLink } from "lucide-react";

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/jobs?limit=30")
      .then((res) => res.json())
      .then((data) => {
        setJobs(data.jobs || []);
        setTotal(data.total || 0);
      })
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" /> Trang chủ
        </Link>
        <Link
          href="/jobs/recommended"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Gợi ý cho tôi
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Tin tuyển dụng</h1>
      <p className="text-gray-600 mb-8">
        Cập nhật việc làm từ nhiều nguồn. AI sẽ sàng lọc việc phù hợp với CV của bạn tại mục &quot;Gợi ý cho tôi&quot;.
      </p>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Đang tải...</div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
          Chưa có tin tuyển dụng. Admin có thể thêm nguồn qua API ingest.
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job: any) => (
            <Link
              key={job._id}
              href={`/jobs/${job._id}`}
              className="block bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{job.title}</h2>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" /> {job.company}
                    </span>
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> {job.location}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                      {job.jobType || "onsite"}
                    </span>
                  </div>
                  {job.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {job.skills.slice(0, 5).map((s: string, i: number) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <ExternalLink className="h-5 w-5 text-gray-400 flex-shrink-0" />
              </div>
            </Link>
          ))}
          {total > jobs.length && (
            <p className="text-center text-sm text-gray-500 mt-4">
              Hiển thị {jobs.length} / {total} tin
            </p>
          )}
        </div>
      )}
    </div>
  );
}
