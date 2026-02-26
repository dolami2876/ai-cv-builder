"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Building2,
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  Star,
} from "lucide-react";

export default function RecommendedJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  const fetchRecommended = (refresh = false) => {
    setLoading(true);
    setError(null);
    fetch(`/api/jobs/recommended${refresh ? "?refresh=1" : ""}`)
      .then((res) => {
        if (!res.ok) return res.json().then((e) => { throw new Error(e.error || "Failed"); });
        return res.json();
      })
      .then((data) => {
        setJobs(data.jobs || []);
        setFromCache(!!data.fromCache);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecommended();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" /> Tất cả tin
        </Link>
        <button
          onClick={() => fetchRecommended(true)}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Cập nhật gợi ý
        </button>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <Star className="h-8 w-8 text-amber-500" />
        Việc làm gợi ý cho bạn
      </h1>
      <p className="text-gray-600 mb-8">
        AI đã sàng lọc và chấm điểm phù hợp giữa CV của bạn và từng tin tuyển dụng.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading && jobs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Đang phân tích CV và so khớp việc làm...
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
          Chưa có gợi ý. Hãy tạo CV và đảm bảo đã có tin tuyển dụng trong hệ thống.
        </div>
      ) : (
        <div className="space-y-4">
          {fromCache && (
            <p className="text-sm text-gray-500">
              Đang hiển thị kết quả đã lưu. Bấm &quot;Cập nhật gợi ý&quot; để chạy lại matching.
            </p>
          )}
          {jobs.map((job: any) => (
            <Link
              key={job._id}
              href={`/jobs/${job._id}`}
              className="block bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-sm font-medium">
                      Điểm: {job.matchScore}/100
                    </span>
                  </div>
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
                  {job.matchExplanation && (
                    <p className="mt-3 text-sm text-gray-700 bg-emerald-50/50 rounded-lg p-3 border border-emerald-100">
                      {job.matchExplanation}
                    </p>
                  )}
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
        </div>
      )}
    </div>
  );
}
