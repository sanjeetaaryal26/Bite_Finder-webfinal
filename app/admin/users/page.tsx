"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { deleteAdminUser, getAdminUsers, type AdminUser } from "@/lib/admin";

const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, checkAuth } = useAuth();

  const initialPage = Math.max(1, Number(searchParams.get("page")) || 1);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPage(initialPage);
  }, [initialPage]);

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

  const load = useCallback(async (currentPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminUsers({ page: currentPage, limit: PAGE_SIZE });
      setUsers(data.users);
      setTotalPages(Math.max(1, data.pagination.totalPages || 1));
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to fetch users";
      setError(message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    load(page);
  }, [load, page, user]);

  const updateQueryPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage <= 1) params.delete("page");
    else params.set("page", String(nextPage));
    router.push(`/admin/users${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const onDelete = async (selected: AdminUser) => {
    const ok = window.confirm(`Delete ${selected.name} (${selected.email})? This cannot be undone.`);
    if (!ok) return;
    try {
      await deleteAdminUser(selected._id);
      await load(page);
      window.alert("User deleted.");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Delete failed";
      window.alert(message);
    }
  };

  return (
    <main className="min-h-screen bg-orange-50 p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-sm text-gray-600">Admin user management with pagination.</p>
          </div>
          <Link href="/admin" className="rounded-lg border border-orange-200 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-orange-50">
            Back to admin
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-x-auto rounded-2xl border border-orange-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-orange-100 bg-orange-50/60">
                <th className="px-4 py-3 font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Email</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Role</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Created</th>
                <th className="px-4 py-3 font-semibold text-gray-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-8 text-gray-500" colSpan={5}>
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-gray-500" colSpan={5}>
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="border-b border-orange-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                    <td className="px-4 py-3 text-gray-700">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <Link href={`/admin/users/${u._id}`} className="rounded-md border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50">
                          View
                        </Link>
                        <Link href={`/admin/users/${u._id}/edit`} className="rounded-md border border-orange-200 px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-50">
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => onDelete(u)}
                          className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              const next = Math.max(1, page - 1);
              setPage(next);
              updateQueryPage(next);
            }}
            disabled={page <= 1}
            className="rounded-lg border bg-white px-4 py-2 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <p className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </p>
          <button
            type="button"
            onClick={() => {
              const next = Math.min(totalPages, page + 1);
              setPage(next);
              updateQueryPage(next);
            }}
            disabled={page >= totalPages}
            className="rounded-lg border bg-white px-4 py-2 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
}
