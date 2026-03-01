import api from "./api";

export async function forgotPassword(email: string) {
  const { data } = await api.post<{ success: boolean; message: string }>("/auth/forgot-password", { email });
  return data;
}

export async function resetPassword(token: string, password: string) {
  const { data } = await api.post<{ success: boolean; message: string }>(`/auth/reset-password/${token}`, { password });
  return data;
}
