import api, { getAccessToken } from "./api";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type UploadFolder = "restaurants" | "foods" | "profiles";

export type PresignedResponse = {
  uploadURL: string;
  fileURL: string;
};

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[0])) {
    return "Allowed types: JPEG, PNG, WebP";
  }
  if (file.size > MAX_SIZE_BYTES) {
    return "Max file size is 5MB";
  }
  return null;
}

export async function getPresignedUrl(
  fileName: string,
  fileType: string,
  folder: UploadFolder
): Promise<PresignedResponse> {
  // Backend now provides a Cloudinary endpoint — keep for backwards compatibility
  const { data } = await api.post<{
    success: boolean;
    message: string;
    data: PresignedResponse;
  }>("/upload/presigned-url", { fileName, fileType, folder });
  if (!data.success || !data.data) throw new Error(data.message || "Failed to get upload URL");
  return data.data;
}

export async function uploadFileToS3(
  uploadURL: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed: ${xhr.status}`));
    });
    xhr.addEventListener("error", () => reject(new Error("Upload failed")));
    xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

    xhr.open("PUT", uploadURL);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}

export async function uploadImage(
  file: File,
  folder: UploadFolder,
  onProgress?: (percent: number) => void
): Promise<string> {
  const err = validateImageFile(file);
  if (err) throw new Error(err);

  // Use Cloudinary endpoint on backend (multipart/form-data)
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);

  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await api.post("/upload/cloudinary", form, {
    // Do NOT set Content-Type manually; let the browser set the multipart boundary.
    headers,
    onUploadProgress: (e) => {
      if (e.lengthComputable && onProgress && typeof e.total === "number" && e.total > 0) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });

  if (!response.data || !response.data.success) {
    throw new Error(response.data?.message || "Upload failed");
  }

  return response.data.data.url;
}
