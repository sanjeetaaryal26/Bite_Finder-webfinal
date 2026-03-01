"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export const useRequireAuth = () => {
  const router = useRouter();
  const { user, accessToken, loading, checkAuth } = useAuth();

  useEffect(() => {
    if (!loading && !accessToken) {
      router.replace("/login");
      return;
    }

    if (accessToken && !user && !loading) {
      checkAuth().catch(() => router.replace("/login"));
    }
  }, [accessToken, checkAuth, loading, router, user]);

  return { user, accessToken, loading };
};
