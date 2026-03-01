"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCallback, useEffect, useState } from "react";
import { getAdminUserById, type AdminUser } from "@/lib/admin";

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading, checkAuth } = useAuth();
  const [detail, setDetail] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      checkAuth().then((u) => {
        if (!u || u.role !== "admin") router.replace("/login");
      });
      return;
    }
    if (user.role !== "admin") router.replace("/dashboard");
  }, [authLoading, checkAuth, router, user]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminUserById(params.id);
      setDetail(data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to load user";
      setError(message);
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    load();
  }, [load, user]);

  return (
    <main className="min-h-screen bg-orange-50 p-6 md:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">User details</h1>
          <div className="flex gap-2">
            <Link href="/admin/users" className="rounded-lg border border-orange-200 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-orange-50">
              Back
            </Link>
            <Link href={`/admin/users/${params.id}/edit`} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700">
              Edit user
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-orange-100 bg-white p-6 text-gray-500">Loading...</div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : detail ? (
          <div className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">User ID</dt>
                <dd className="mt-1 font-mono text-sm text-gray-900">{detail._id}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{detail.name}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{detail.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Role</dt>
                <dd className="mt-1 text-sm text-gray-900">{detail.role}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">{new Date(detail.createdAt).toLocaleString()}</dd>
              </div>
              {detail.updatedAt && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Last updated</dt>
                  <dd className="mt-1 text-sm text-gray-900">{new Date(detail.updatedAt).toLocaleString()}</dd>
                </div>
              )}
            </dl>
          </div>
        ) : null}
      </div>
    </main>
  );
}
