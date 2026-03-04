'use client';

import { useMemo, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Brain, Loader2, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface CareerSuggestion {
  career: string;
  jobTitles: string[];
  matchScore: number;
  reasons: string[];
  keywords: string[];
  requiredSkills: string[];
  growthPotential: string;
}

interface CareerSuggestionResponse {
  suggestedCareers: CareerSuggestion[];
  summary: string;
  nextSteps: string[];
}

const POPULAR_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Python', 'SQL', 'UI/UX',
  'Figma', 'Data Analysis', 'Communication', 'Problem Solving', 'Project Management',
];

const POPULAR_EDUCATION = [
  'Cử nhân Công nghệ Thông tin',
  'Cử nhân Khoa học Máy tính',
  'Cử nhân Kinh tế',
  'Cử nhân Marketing',
  'Cử nhân Quản trị Kinh doanh',
];

const POPULAR_INTERESTS = [
  'Phát triển web',
  'AI / Machine Learning',
  'Phân tích dữ liệu',
  'Thiết kế sản phẩm',
  'Khởi nghiệp',
  'Làm việc remote',
];

const POPULAR_GOALS = [
  'Trở thành Frontend Developer trong 1 năm',
  'Trở thành Data Analyst trong 6 tháng',
  'Thăng tiến lên Team Lead trong 2 năm',
  'Chuyển ngành sang IT',
  'Ứng tuyển công ty product lớn',
];

export default function CareerSuggestionPage() {
  const { isSignedIn } = useUser();
  const [skills, setSkills] = useState('');
  const [education, setEducation] = useState('');
  const [interests, setInterests] = useState('');
  const [goals, setGoals] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CareerSuggestionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSignedIn) {
      setError('Vui lòng đăng nhập để sử dụng công cụ này');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/career-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills, education, interests, goals }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to get career suggestions');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const getGrowthColor = (potential: string) => {
    if (potential.toLowerCase().includes('high')) return 'text-green-600 bg-green-50';
    if (potential.toLowerCase().includes('medium')) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const addChipValue = (current: string, value: string) => {
    if (!current.trim()) return value;
    const parts = current.split(',').map((s) => s.trim().toLowerCase());
    if (parts.includes(value.toLowerCase())) return current;
    return `${current}, ${value}`;
  };

  const buildSuggestions = (input: string, source: string[]) => {
    const term = input.trim().toLowerCase();
    if (!term) return source.slice(0, 6);
    return source
      .filter((item) => item.toLowerCase().includes(term))
      .slice(0, 6);
  };

  const skillSuggestions = useMemo(() => buildSuggestions(skills.split(',').pop() || '', POPULAR_SKILLS), [skills]);
  const educationSuggestions = useMemo(() => buildSuggestions(education, POPULAR_EDUCATION), [education]);
  const interestSuggestions = useMemo(() => buildSuggestions(interests.split(',').pop() || '', POPULAR_INTERESTS), [interests]);
  const goalSuggestions = useMemo(() => buildSuggestions(goals, POPULAR_GOALS), [goals]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Brain className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gray-900">AI Gợi ý Ngành Nghề</h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Khám phá ngành nghề phù hợp với kỹ năng, học vấn và sở thích của bạn
          </p>
        </div>

        <div className="mb-8 rounded-2xl bg-white p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Kỹ năng của bạn <span className="text-red-500">*</span>
              </label>
              <textarea
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Ví dụ: JavaScript, Python, Quản lý dự án, Giao tiếp..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {skillSuggestions.map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setSkills((prev) => addChipValue(prev, item))}
                    className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Học vấn</label>
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="Ví dụ: Cử nhân Công nghệ Thông tin..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {educationSuggestions.map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setEducation(item)}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Sở thích / Mục tiêu</label>
              <textarea
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="Ví dụ: Phát triển phần mềm, Làm việc với dữ liệu..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {interestSuggestions.map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setInterests((prev) => addChipValue(prev, item))}
                    className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 hover:bg-purple-100"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Mục tiêu nghề nghiệp</label>
              <textarea
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="Ví dụ: Trở thành Senior Developer trong 3 năm..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {goalSuggestions.map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setGoals(item)}
                    className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isSignedIn}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Đang phân tích...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Nhận Gợi ý Ngành Nghề
                </>
              )}
            </button>

            {!isSignedIn && (
              <p className="text-center text-sm text-gray-500">
                <Link href="/sign-in" className="text-blue-600 hover:underline">
                  Đăng nhập
                </Link>{' '}
                để sử dụng công cụ này
              </p>
            )}
          </form>
        </div>

        {error && <div className="mb-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

        {result && (
          <div className="space-y-8">
            <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white shadow-xl">
              <h2 className="mb-4 text-2xl font-bold">Tóm tắt Phân tích</h2>
              <p className="text-lg leading-relaxed">{result.summary}</p>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Ngành Nghề Đề Xuất</h2>
              {result.suggestedCareers.map((career, index) => {
                const targetJobFromSuggestion = career.jobTitles?.[0] || career.career;
                const href = `/tools/cv-generator?${new URLSearchParams({
                  targetJob: targetJobFromSuggestion,
                  skills,
                  education,
                }).toString()}`;

                return (
                  <div key={index} className="rounded-xl border-l-4 border-blue-500 bg-white p-6 shadow-lg">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h3 className="mb-2 text-2xl font-bold text-gray-900">{career.career}</h3>
                        <div className="mb-2 flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600">Điểm phù hợp:</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-32 rounded-full bg-gray-200">
                              <div className="h-2 rounded-full bg-blue-600 transition-all" style={{ width: `${career.matchScore}%` }} />
                            </div>
                            <span className="text-lg font-bold text-blue-600">{career.matchScore}%</span>
                          </div>
                        </div>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-sm font-medium ${getGrowthColor(career.growthPotential)}`}>
                        {career.growthPotential}
                      </span>
                    </div>

                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                      <div>
                        <h4 className="mb-2 font-semibold text-gray-900">Vị trí công việc:</h4>
                        <ul className="space-y-1">
                          {career.jobTitles.map((title, i) => (
                            <li key={i} className="flex items-center gap-2 text-gray-700">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              {title}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="mb-2 font-semibold text-gray-900">Lý do phù hợp:</h4>
                        <ul className="space-y-1">
                          {career.reasons.map((reason, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-700">
                              <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-blue-500" />
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="mb-2 font-semibold text-gray-900">Kỹ năng cần thiết:</h4>
                        <div className="flex flex-wrap gap-2">
                          {career.requiredSkills.map((skill, i) => (
                            <span key={i} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="mb-2 font-semibold text-gray-900">Từ khóa quan trọng:</h4>
                        <div className="flex flex-wrap gap-2">
                          {career.keywords.map((keyword, i) => (
                            <span key={i} className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <Link
                        href={href}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        Tạo CV với ngành này
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-xl border border-green-200 bg-green-50 p-6">
              <h3 className="mb-4 text-xl font-bold text-gray-900">Các Bước Tiếp Theo</h3>
              <ol className="space-y-3">
                {result.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-600 font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="pt-1 text-gray-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-xl bg-white p-8 text-center shadow-lg">
              <h3 className="mb-4 text-2xl font-bold text-gray-900">Sẵn sàng tạo CV?</h3>
              <p className="mb-6 text-gray-600">Sử dụng thông tin này để tạo CV chuyên nghiệp với AI</p>
              <Link
                href="/tools/cv-generator"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Tạo CV Ngay <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
