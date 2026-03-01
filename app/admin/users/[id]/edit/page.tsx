"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { getAdminUserById, updateAdminUser, type AdminUser } from "@/lib/admin";

type FormState = {
  name: string;
  email: string;
  role: "user" | "admin" | "owner";
  profileImage: string;
};

export default function AdminUserEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading, checkAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    role: "user",
    profileImage: "",
  });

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
      const data: AdminUser = await getAdminUserById(params.id);
      setForm({
        name: data.name || "",
        email: data.email || "",
        role: data.role || "user",
        profileImage: data.profileImage || "",
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to load user";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    load();
  }, [load, user]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateAdminUser(params.id, {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        role: form.role,
        profileImage: form.profileImage.trim(),
      });
      router.push(`/admin/users/${params.id}`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to update user";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-orange-50 p-6 md:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Edit user</h1>
          <Link href={`/admin/users/${params.id}`} className="rounded-lg border border-orange-200 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-orange-50">
            Cancel
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-orange-100 bg-white p-6 text-gray-500">Loading...</div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                id="name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 text-gray-800"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 text-gray-800"
                required
              />
            </div>

            <div>
              <label htmlFor="role" className="mb-1 block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                value={form.role}
                onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as FormState["role"] }))}
                className="w-full rounded-lg border px-3 py-2 text-gray-800"
              >
                <option value="user">user</option>
                <option value="owner">owner</option>
                <option value="admin">admin</option>
              </select>
            </div>

            <div>
              <label htmlFor="profileImage" className="mb-1 block text-sm font-medium text-gray-700">
                Profile image URL
              </label>
              <input
                id="profileImage"
                value={form.profileImage}
                onChange={(e) => setForm((prev) => ({ ...prev, profileImage: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 text-gray-800"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save user"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
