"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../_component/sidebar";
import ImageUpload from "../_component/ImageUpload";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  const handleProfileImageChange = (url: string) => {
    if (!url) return;
    setSaving(true);
    updateProfile({ profileImage: url })
      .then(() => toast.success("Profile picture updated"))
      .catch(() => toast.error("Failed to update profile"))
      .finally(() => setSaving(false));
  };

  const handleRemoveProfileImage = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile({ profileImage: "" });
      toast.success("Profile picture removed");
      setShowUpload(true);
    } catch (err) {
      toast.error("Failed to remove profile picture");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || name.trim() === user.name) return;
    setSaving(true);
    try {
      await updateProfile({ name: name.trim() });
      toast.success("Name updated");
    } catch {
      toast.error("Failed to update name");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    router.replace("/login");
    return null;
  }

  const mockUser = { name: user.name, level: "Profile", role: user.role };

  const initials = user.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-orange-50" style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif" }}>
      <Sidebar activeTab="profile" user={mockUser} />

      <main className="ml-64 min-h-screen">
        {/* ── Header ── */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-orange-100 px-8 py-4">
          <h1 className="text-xl font-extrabold text-gray-800">My Profile</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage your account information</p>
        </header>

        <div className="px-8 py-8 max-w-lg space-y-5">

          {/* ── Avatar Card ── */}
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
            {/* Orange top banner */}
            <div className="h-20 bg-gradient-to-r from-orange-400 to-orange-500 relative">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />
            </div>

            <div className="px-6 pb-6">
              {/* Avatar */}
              <div className="flex justify-center -mt-12 mb-4">
                <div className="relative group">
                  {user.profileImage ? (
                    <>
                      <img
                        src={user.profileImage}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveProfileImage}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full border border-red-200 text-red-400 text-xs shadow flex items-center justify-center hover:bg-red-50 transition"
                        title="Remove photo"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                      <span className="text-2xl font-black text-white">{initials}</span>
                    </div>
                  )}

                  {/* Camera badge */}
                  <button
                    type="button"
                    onClick={() => setShowUpload((s) => !s)}
                    className="absolute bottom-0 right-0 w-7 h-7 bg-orange-500 hover:bg-orange-600 rounded-full border-2 border-white flex items-center justify-center shadow transition"
                    title="Change photo"
                  >
                    <span className="text-white text-xs">📷</span>
                  </button>
                </div>
              </div>

              {/* Name + badge */}
              <div className="text-center mb-1">
                <p className="font-extrabold text-gray-800 text-lg">{user.name}</p>
                <span className="inline-block bg-orange-100 text-orange-600 text-xs font-bold px-3 py-0.5 rounded-full border border-orange-200 mt-1">
                  🍽️ Foodie Explorer
                </span>
              </div>

              {/* ImageUpload toggle */}
              {showUpload && (
                <div className="mt-4 p-3 bg-orange-50 rounded-xl border border-orange-100">
                  <ImageUpload
                    folder="profiles"
                    value={user.profileImage || ""}
                    onChange={(url) => {
                      handleProfileImageChange(url);
                      setShowUpload(false);
                    }}
                    label=""
                  />
                </div>
              )}
            </div>
          </div>

          {/* ── Name Field ── */}
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-3">
              Full Name
            </label>
            <form onSubmit={handleSaveName} className="flex gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                placeholder="Your full name"
              />
              <button
                type="submit"
                disabled={saving || name.trim() === user.name}
                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold shadow-md shadow-orange-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {saving ? "…" : "Save"}
              </button>
            </form>
            {saving && (
              <p className="text-xs text-orange-500 mt-2">⏳ Updating…</p>
            )}
          </div>

          {/* ── Email Field ── */}
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-3">
              Email Address
            </label>
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-orange-50 border border-orange-100">
              <span className="text-orange-400 text-sm">✉️</span>
              <p className="text-sm text-gray-700 font-medium">{user.email}</p>
              <span className="ml-auto text-[10px] bg-green-50 text-green-600 border border-green-100 font-bold px-2 py-0.5 rounded-full">
                Verified
              </span>
            </div>
          </div>

          {/* ── Logout Button ── */}
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full py-3 rounded-2xl border border-red-200 text-red-400 hover:bg-red-50 hover:border-red-300 text-sm font-bold transition shadow-sm"
          >
            🚪 Logout
          </button>

        </div>
      </main>

      {/* ── Logout Confirm Modal ── */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-orange-100 p-7 w-full max-w-sm text-center">
            <p className="text-4xl mb-3">🚪</p>
            <h2 className="text-lg font-extrabold text-gray-800 mb-1">Logout?</h2>
            <p className="text-sm text-gray-400 mb-6">
              Are you sure you want to log out of BiteFinder?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-orange-200 text-orange-500 font-bold text-sm hover:bg-orange-50 transition"
              >
                Stay
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  router.replace("/login");
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm shadow transition"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}