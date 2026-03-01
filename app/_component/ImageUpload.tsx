"use client";

import { useCallback, useId, useMemo, useState } from "react";
import { uploadImage, validateImageFile, type UploadFolder } from "@/lib/upload";
import { useToast } from "@/context/ToastContext";

const ALLOWED_ACCEPT = "image/jpeg,image/png,image/webp";

type ImageUploadProps = {
  folder: UploadFolder;
  value: string | string[];
  onChange: (url: string) => void;
  onMultipleChange?: (urls: string[]) => void;
  multiple?: boolean;
  maxCount?: number;
  label?: string;
  className?: string;
};

export default function ImageUpload({
  folder,
  value,
  onChange,
  onMultipleChange,
  multiple = false,
  maxCount = 10,
  label = "Upload image",
  className = "",
}: ImageUploadProps) {
  const inputId = `image-upload-${folder}-${useId().replace(/:/g, "")}`;
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const urls = useMemo(
    () => (multiple ? (Array.isArray(value) ? value : value ? [value] : []) : []),
    [multiple, value]
  );
  const singleUrl = useMemo(
    () => (multiple ? "" : typeof value === "string" ? value : ""),
    [multiple, value]
  );

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      const err = validateImageFile(file);
      if (err) {
        setError(err);
        toast.error(err);
        return null;
      }
      setLoading(true);
      setProgress(0);
      try {
        const url = await uploadImage(file, folder, (p) => setProgress(p));
        toast.success("Image uploaded");
        return url;
      } catch (e) {
        const message = e instanceof Error ? e.message : "Upload failed";
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setLoading(false);
        setProgress(0);
      }
    },
    [folder, toast]
  );

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      const file = files[0];
      if (multiple) {
        const current = urls;
        if (current.length >= maxCount) {
          toast.error(`Max ${maxCount} images`);
          return;
        }
        const url = await handleFile(file);
        if (url) {
          const next = [...current, url];
          onMultipleChange?.(next);
        }
      } else {
        const url = await handleFile(file);
        if (url) onChange(url);
      }
    },
    [multiple, urls, maxCount, handleFile, onChange, onMultipleChange, toast]
  );

  const removeUrl = useCallback(
    (url: string) => {
      if (multiple && onMultipleChange) {
        const next = urls.filter((u) => u !== url);
        onMultipleChange(next);
      } else {
        onChange("");
      }
    },
    [multiple, urls, onChange, onMultipleChange]
  );

  const displayUrls = multiple ? urls : singleUrl ? [singleUrl] : [];

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-gray-600 mb-2">{label}</label>
      )}

      {/* Drop zone / trigger */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`
          border-2 border-dashed rounded-xl p-6 text-center transition
          ${dragOver ? "border-orange-400 bg-orange-50" : "border-orange-200 bg-orange-50/50"}
          ${loading ? "pointer-events-none opacity-80" : "cursor-pointer hover:border-orange-300"}
        `}
      >
        <input
          type="file"
          accept={ALLOWED_ACCEPT}
          className="hidden"
          id={inputId}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          disabled={loading}
        />
        <label htmlFor={inputId} className="cursor-pointer block">
          {loading ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-orange-600">Uploading…</p>
              <div className="h-2 bg-orange-200 rounded-full overflow-hidden max-w-xs mx-auto">
                <div
                  className="h-full bg-orange-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <p className="text-4xl mb-2">📷</p>
              <p className="text-sm text-gray-600">
                Drag & drop or <span className="text-orange-500 font-semibold">browse</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP · Max 5MB</p>
            </>
          )}
        </label>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}

      {/* Previews */}
      {displayUrls.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {displayUrls.map((url) => (
            <div
              key={url}
              className="relative group rounded-xl overflow-hidden border border-orange-200 bg-white shadow-sm"
            >
              <img
                src={url}
                alt="Upload"
                className="w-24 h-24 object-cover"
              />
              <button
                type="button"
                onClick={() => removeUrl(url)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm font-medium transition"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
