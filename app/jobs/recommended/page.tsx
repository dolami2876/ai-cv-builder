"use client";



import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import {

  MapPin,

  Building2,

  ArrowLeft,

  ExternalLink,

  RefreshCw,

  Star,

  Filter,

} from "lucide-react";



type Job = {

  _id: string;

  title: string;

  company: string;

  location?: string;

  jobType?: string;

  skills?: string[];

  matchScore: number;

  matchExplanation?: string;

};



const EMPLOYMENT_TYPE_OPTIONS = [

  { value: "full-time", label: "Full-time" },

  { value: "part-time", label: "Part-time" },

  { value: "internship", label: "Internship" },

  { value: "contract", label: "Contract" },

  { value: "freelance", label: "Freelance" },

  { value: "temporary", label: "Temporary" },

] as const;



const WORK_MODE_OPTIONS = [

  { value: "onsite", label: "On-site" },

  { value: "remote", label: "Remote" },

  { value: "hybrid", label: "Hybrid" },

] as const;



const LOCATION_SCOPE_OPTIONS = [

  { value: "vietnam", label: "Trong nước (Việt Nam)" },

  { value: "abroad", label: "Nước ngoài" },

] as const;



export default function RecommendedJobsPage() {

  const [jobs, setJobs] = useState<Job[]>([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [fromCache, setFromCache] = useState(false);



  const [selectedEmploymentTypes, setSelectedEmploymentTypes] = useState<string[]>([]);

  const [selectedWorkModes, setSelectedWorkModes] = useState<string[]>([]);

  const [selectedLocationScope, setSelectedLocationScope] = useState<string>("");



  const [appliedEmploymentTypes, setAppliedEmploymentTypes] = useState<string[]>([]);

  const [appliedWorkModes, setAppliedWorkModes] = useState<string[]>([]);

  const [appliedLocationScope, setAppliedLocationScope] = useState<string>("");



  const [hasAppliedPreferences, setHasAppliedPreferences] = useState(false);



  const hasFilters =

    selectedEmploymentTypes.length > 0 ||

    selectedWorkModes.length > 0 ||

    !!selectedLocationScope;



  const queryString = useMemo(() => {

    const params = new URLSearchParams();

    if (appliedEmploymentTypes.length > 0) {

      params.set("employmentTypes", appliedEmploymentTypes.join(","));

    }

    if (appliedWorkModes.length > 0) {

      params.set("workModes", appliedWorkModes.join(","));

    }

    if (appliedLocationScope) {

      params.set("locationScope", appliedLocationScope);

    }

    const query = params.toString();

    return query ? `?${query}` : "";

  }, [appliedEmploymentTypes, appliedWorkModes, appliedLocationScope]);



  const fetchRecommended = (

    refresh = false,

    employmentTypes = appliedEmploymentTypes,

    workModes = appliedWorkModes,

    locationScope = appliedLocationScope

  ) => {

    setLoading(true);

    setError(null);



    const params = new URLSearchParams();

    if (refresh) params.set("refresh", "1");

    if (employmentTypes.length > 0) {

      params.set("employmentTypes", employmentTypes.join(","));

    }

    if (workModes.length > 0) {

      params.set("workModes", workModes.join(","));

    }

    if (locationScope) {

      params.set("locationScope", locationScope);

    }



    const query = params.toString();



    fetch(`/api/jobs/recommended${query ? `?${query}` : ""}`)

      .then((res) => {

        if (!res.ok) {

          return res.json().then((e) => {

            throw new Error(e.error || "Failed");

          });

        }

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

    if (!hasAppliedPreferences) return;

    fetchRecommended();

    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [queryString, hasAppliedPreferences]);



  const toggleMultiSelect = (

    value: string,

    currentValues: string[],

    setValues: (next: string[]) => void

  ) => {

    if (currentValues.includes(value)) {

      setValues(currentValues.filter((v) => v !== value));

      return;

    }

    setValues([...currentValues, value]);

  };



  const applyPreferences = () => {

    setAppliedEmploymentTypes(selectedEmploymentTypes);

    setAppliedWorkModes(selectedWorkModes);

    setAppliedLocationScope(selectedLocationScope);

    setHasAppliedPreferences(true);

    // Luôn chạy refresh để tìm job mới theo CV + bộ lọc vừa chọn
    fetchRecommended(true, selectedEmploymentTypes, selectedWorkModes, selectedLocationScope);

  };



  const clearFilters = () => {

    setSelectedEmploymentTypes([]);

    setSelectedWorkModes([]);

    setSelectedLocationScope("");



    setAppliedEmploymentTypes([]);

    setAppliedWorkModes([]);

    setAppliedLocationScope("");



    setHasAppliedPreferences(false);

    setJobs([]);

    setFromCache(false);

    setError(null);

  };



  return (

    <div className="container mx-auto max-w-5xl px-4 py-8">

      <div className="mb-8 flex items-center justify-between">

        <Link

          href="/jobs"

          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"

        >

          <ArrowLeft className="h-4 w-4" /> Tất cả tin

        </Link>

        <button

          onClick={() => fetchRecommended(true)}

          disabled={loading || !hasAppliedPreferences}

          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"

        >

          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />

          Cập nhật gợi ý

        </button>

      </div>



      <h1 className="mb-2 flex items-center gap-2 text-3xl font-bold text-gray-900">

        <Star className="h-8 w-8 text-amber-500" />

        Việc làm gợi ý cho bạn

      </h1>

      <p className="mb-6 text-gray-600">

        Hãy chọn nhu cầu cơ bản để AI lọc ra các việc làm phù hợp với CV của bạn.

      </p>



      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

        <div className="mb-4 flex items-center gap-2 text-gray-800">

          <Filter className="h-4 w-4" />

          <span className="text-sm font-semibold">Bộ lọc cơ bản</span>

        </div>



        <div className="grid gap-5 md:grid-cols-2">

          <div>

            <p className="mb-2 text-sm font-medium text-gray-700">Loại hình công việc</p>

            <div className="flex flex-wrap gap-2">

              {EMPLOYMENT_TYPE_OPTIONS.map((option) => {

                const selected = selectedEmploymentTypes.includes(option.value);

                return (

                  <button

                    key={option.value}

                    type="button"

                    onClick={() =>

                      toggleMultiSelect(

                        option.value,

                        selectedEmploymentTypes,

                        setSelectedEmploymentTypes

                      )

                    }

                    className={`rounded-full border px-3 py-1.5 text-sm transition ${

                      selected

                        ? "border-emerald-600 bg-emerald-50 text-emerald-700"

                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"

                    }`}

                  >

                    {option.label}

                  </button>

                );

              })}

            </div>

          </div>



          <div>

            <p className="mb-2 text-sm font-medium text-gray-700">Work mode</p>

            <div className="flex flex-wrap gap-2">

              {WORK_MODE_OPTIONS.map((option) => {

                const selected = selectedWorkModes.includes(option.value);

                return (

                  <button

                    key={option.value}

                    type="button"

                    onClick={() =>

                      toggleMultiSelect(option.value, selectedWorkModes, setSelectedWorkModes)

                    }

                    className={`rounded-full border px-3 py-1.5 text-sm transition ${

                      selected

                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"

                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"

                    }`}

                  >

                    {option.label}

                  </button>

                );

              })}

            </div>

          </div>



          <div className="md:col-span-2">

            <p className="mb-2 text-sm font-medium text-gray-700">Khu vực làm việc</p>

            <div className="flex flex-wrap gap-2">

              {LOCATION_SCOPE_OPTIONS.map((option) => {

                const selected = selectedLocationScope === option.value;

                return (

                  <button

                    key={option.value}

                    type="button"

                    onClick={() =>

                      setSelectedLocationScope((prev) => (prev === option.value ? "" : option.value))

                    }

                    className={`rounded-full border px-3 py-1.5 text-sm transition ${

                      selected

                        ? "border-sky-600 bg-sky-50 text-sky-700"

                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"

                    }`}

                  >

                    {option.label}

                  </button>

                );

              })}

            </div>

          </div>

        </div>



        <div className="mt-4 flex flex-wrap items-center gap-3">

          <button

            type="button"

            onClick={applyPreferences}

            disabled={loading || !hasFilters}

            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"

          >

            Áp dụng bộ lọc

          </button>



          {hasFilters && (

            <button

              type="button"

              onClick={clearFilters}

              className="text-sm font-medium text-gray-600 underline-offset-2 hover:text-gray-900 hover:underline"

            >

              Xoá bộ lọc

            </button>

          )}

        </div>

      </div>



      {error && (

        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">

          {error}

        </div>

      )}



      {!hasAppliedPreferences ? (

        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">

          Chọn ít nhất một option rồi bấm &quot;Áp dụng bộ lọc&quot; để nhận danh sách việc làm gợi ý.

        </div>

      ) : loading && jobs.length === 0 ? (

        <div className="py-12 text-center text-gray-500">Đang phân tích CV và so khớp việc làm...</div>

      ) : jobs.length === 0 ? (

        <div className="rounded-xl bg-white p-8 text-center text-gray-500 shadow">

          Không tìm thấy việc làm phù hợp với bộ lọc hiện tại. Hãy thử bỏ bớt điều kiện.

        </div>

      ) : (

        <div className="space-y-4">

          {fromCache && (

            <p className="text-sm text-gray-500">

              Đang hiển thị kết quả đã lưu. Bấm &quot;Cập nhật gợi ý&quot; để chạy lại matching.

            </p>

          )}

          {jobs.map((job) => (

            <Link

              key={job._id}

              href={`/jobs/${job._id}`}

              className="block rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md"

            >

              <div className="flex items-start justify-between gap-4">

                <div className="flex-1">

                  <div className="mb-1 flex items-center gap-2">

                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-sm font-medium text-amber-800">

                      Điểm: {job.matchScore}/100

                    </span>

                  </div>

                  <h2 className="text-lg font-bold text-gray-900">{job.title}</h2>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">

                    <span className="flex items-center gap-1">

                      <Building2 className="h-4 w-4" /> {job.company}

                    </span>

                    {job.location && (

                      <span className="flex items-center gap-1">

                        <MapPin className="h-4 w-4" /> {job.location}

                      </span>

                    )}

                    <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-700">

                      {job.jobType || "onsite"}

                    </span>

                  </div>

                  {job.matchExplanation && (

                    <p className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50/50 p-3 text-sm text-gray-700">

                      {job.matchExplanation}

                    </p>

                  )}

                  {job.skills && job.skills.length > 0 && (

                    <div className="mt-2 flex flex-wrap gap-1">

                      {job.skills.slice(0, 5).map((s, i) => (

                        <span

                          key={i}

                          className="rounded bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700"

                        >

                          {s}

                        </span>

                      ))}

                    </div>

                  )}

                </div>

                <ExternalLink className="h-5 w-5 flex-shrink-0 text-gray-400" />

              </div>

            </Link>

          ))}

        </div>

      )}

    </div>

  );

}

