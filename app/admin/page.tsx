"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Shield, Trash2, RefreshCw, Save } from "lucide-react";

type AdminSummary = { users: number; premiumUsers: number; resumes: number };

type AdminUser = {
  clerkId: string;
  email: string;
  credits: number;
  isPremium: boolean;
  resumeCount: number;
  createdAt: string;
  updatedAt: string;
};

type AdminResume = {
  _id: string;
  userId: string;
  title: string;
  targetDomain?: string;
  experienceLevel?: string;
  style?: { hexColor: string; font: string; layout: string };
  createdAt: string;
  updatedAt: string;
};

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [resumes, setResumes] = useState<AdminResume[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, u, r] = await Promise.all([
        fetch("/api/admin/summary").then(async (res) => {
          if (!res.ok) throw new Error(await res.text());
          return res.json();
        }),
        fetch("/api/admin/users?limit=100").then(async (res) => {
          if (!res.ok) throw new Error(await res.text());
          return res.json();
        }),
        fetch("/api/admin/resumes?limit=100").then(async (res) => {
          if (!res.ok) throw new Error(await res.text());
          return res.json();
        }),
      ]);
      setSummary(s);
      setUsers(u);
      setResumes(r);
    } catch (e: any) {
      setError(e?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
  }, []);

  const updateUser = async (clerkId: string, patch: Partial<Pick<AdminUser, "credits" | "isPremium">>) => {
    setBusy(`user:${clerkId}`);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(clerkId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u.clerkId === clerkId ? { ...u, ...updated } : u)));
    } finally {
      setBusy(null);
    }
  };

  const deleteResume = async (id: string) => {
    if (!confirm("Delete this resume?")) return;
    setBusy(`resume:${id}`);
    try {
      const res = await fetch(`/api/admin/resumes/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      setResumes((prev) => prev.filter((r) => r._id !== id));
      setSummary((s) => (s ? { ...s, resumes: Math.max(0, s.resumes - 1) } : s));
    } finally {
      setBusy(null);
    }
  };

  const premiumPct = useMemo(() => {
    if (!summary || summary.users === 0) return 0;
    return Math.round((summary.premiumUsers / summary.users) * 100);
  }, [summary]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
              <p className="text-sm text-gray-500">Quản lý users & CV</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
              ← Dashboard
            </Link>
            <button
              onClick={loadAll}
              className="inline-flex items-center gap-2 rounded-lg bg-white border px-4 py-2 text-sm hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>
        </div>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="Users" value={summary.users} />
            <StatCard label="Premium users" value={`${summary.premiumUsers} (${premiumPct}%)`} />
            <StatCard label="Resumes" value={summary.resumes} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border bg-white overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold">Users</h2>
              <span className="text-xs text-gray-500">Top {users.length}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-2">Email</th>
                    <th className="text-left px-4 py-2">ClerkId</th>
                    <th className="text-right px-4 py-2">Credits</th>
                    <th className="text-center px-4 py-2">Premium</th>
                    <th className="text-right px-4 py-2">CVs</th>
                    <th className="text-right px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.clerkId} className="border-t">
                      <td className="px-4 py-2">{u.email}</td>
                      <td className="px-4 py-2 font-mono text-xs text-gray-600">{u.clerkId}</td>
                      <td className="px-4 py-2 text-right">
                        <input
                          className="w-20 rounded border px-2 py-1 text-right"
                          type="number"
                          value={u.credits}
                          onChange={(e) =>
                            setUsers((prev) =>
                              prev.map((x) => (x.clerkId === u.clerkId ? { ...x, credits: Number(e.target.value) } : x))
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={u.isPremium}
                          onChange={(e) =>
                            setUsers((prev) =>
                              prev.map((x) => (x.clerkId === u.clerkId ? { ...x, isPremium: e.target.checked } : x))
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-2 text-right">{u.resumeCount}</td>
                      <td className="px-4 py-2 text-right">
                        <button
                          disabled={busy === `user:${u.clerkId}`}
                          onClick={() => updateUser(u.clerkId, { credits: u.credits, isPremium: u.isPremium })}
                          className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Save className="h-4 w-4" /> Save
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                        No users
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border bg-white overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold">Resumes</h2>
              <span className="text-xs text-gray-500">Top {resumes.length}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-2">Title</th>
                    <th className="text-left px-4 py-2">User</th>
                    <th className="text-left px-4 py-2">Domain</th>
                    <th className="text-left px-4 py-2">Layout</th>
                    <th className="text-right px-4 py-2">Updated</th>
                    <th className="text-right px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resumes.map((r) => (
                    <tr key={r._id} className="border-t">
                      <td className="px-4 py-2">
                        <Link className="hover:underline" href={`/editor/${r._id}`}>
                          {r.title || "Untitled"}
                        </Link>
                      </td>
                      <td className="px-4 py-2 font-mono text-xs text-gray-600">{r.userId}</td>
                      <td className="px-4 py-2">{r.targetDomain || "-"}</td>
                      <td className="px-4 py-2">{r.style?.layout || "-"}</td>
                      <td className="px-4 py-2 text-right">{new Date(r.updatedAt).toLocaleDateString()}</td>
                      <td className="px-4 py-2 text-right">
                        <button
                          disabled={busy === `resume:${r._id}`}
                          onClick={() => deleteResume(r._id)}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {resumes.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                        No resumes
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

