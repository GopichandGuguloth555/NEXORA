"use client";

import { getErrorMessage } from "@/lib/errors";

import React, { useEffect, useEffectEvent, useRef, useState } from "react";
import Image from "next/image";
import { useWorkspace } from "@/context/WorkspaceContext";
import { uploadService } from "@/lib/services/upload.service";
import { FileItem } from "@/lib/types";
import { ToastContainer, ToastMessage } from "@/components/ui/Toast";
import {
  FolderDown,
  UploadCloud,
  Trash2,
  ExternalLink,
  Loader2,
  File,
  FileText,
} from "lucide-react";

export default function FilesPage() {
  const { currentWorkspace } = useWorkspace();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastIdRef = useRef(0);

  const showToast = (type: "success" | "error" | "info", message: string) => {
    const id = String(++toastIdRef.current);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const res = await uploadService.getFiles(currentWorkspace?.id);
      setFiles(res.data || []);
    } catch (err: unknown) {
      showToast("error", getErrorMessage(err, "Failed to load files"));
    } finally {
      setLoading(false);
    }
  };

  const refreshFiles = useEffectEvent(() => {
    void fetchFiles();
  });

  useEffect(() => {
    const timeoutId = window.setTimeout(refreshFiles, 0);
    return () => window.clearTimeout(timeoutId);
  }, [currentWorkspace]);

  const validateFile = (file: File): string | null => {
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf"];
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    const allowedMimeTypes = ["image/jpeg", "image/png", "application/pdf"];

    const isValidExt = allowedExtensions.includes(ext);
    const isValidMime = allowedMimeTypes.includes(file.type);

    if (!isValidExt && !isValidMime) {
      return "Only JPG, JPEG, PNG, and PDF files are allowed.";
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return "File size exceeds the 5 MB limit.";
    }

    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const errorMsg = validateFile(file);
      if (errorMsg) {
        showToast("error", errorMsg);
        setSelectedFile(null);
        e.target.value = "";
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const errorMsg = validateFile(selectedFile);
    if (errorMsg) {
      showToast("error", errorMsg);
      return;
    }

    try {
      setUploading(true);
      const res = await uploadService.uploadFile(selectedFile, currentWorkspace?.id);
      if (res.success && res.data) {
        showToast("success", `File "${res.data.name}" uploaded successfully!`);
        setSelectedFile(null);
        await fetchFiles();
      }
    } catch (err: unknown) {
      showToast("error", getErrorMessage(err, "File upload failed"));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (id: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    try {
      await uploadService.deleteFile(id);
      setFiles((prev) => prev.filter((f) => f.id !== id));
      showToast("success", "File deleted successfully");
    } catch (err: unknown) {
      showToast("error", getErrorMessage(err, "Failed to delete file"));
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isImage = (f: FileItem) => f.mimeType?.startsWith("image/") || /\.(jpg|jpeg|png)$/i.test(f.name);
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <FolderDown className="w-6 h-6 text-zinc-400" />
            <span>File Management</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Cloudinary asset storage for <span className="text-zinc-300 font-semibold">{currentWorkspace?.name || "Workspace"}</span> (JPG, PNG, PDF up to 5MB)
          </p>
        </div>
      </div>

      {/* Upload Drag/Select Zone */}
      <form
        onSubmit={handleUpload}
        className="p-6 rounded-3xl bg-[#121212]/90 border border-zinc-800 border-dashed hover:border-zinc-500/50 transition-colors flex flex-col items-center justify-center text-center space-y-3 shadow-xl"
      >
        <div className="p-3.5 rounded-2xl bg-zinc-200/10 text-zinc-400 border border-zinc-500/30">
          <UploadCloud className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-zinc-100">Upload Asset or Document</h3>
          <p className="text-xs text-zinc-400 max-w-sm mt-0.5">
            Supported types: <span className="text-zinc-300 font-semibold">JPG, JPEG, PNG, PDF</span> (Max 5 MB)
          </p>
        </div>

        <input
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={handleFileChange}
          className="text-xs text-zinc-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-zinc-200 file:text-black hover:file:bg-zinc-300 file:cursor-pointer transition-all"
        />

        {selectedFile && (
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <span className="text-xs font-semibold text-zinc-300 bg-zinc-200/5 px-3 py-1.5 rounded-xl border border-zinc-500/30">
              Selected: {selectedFile.name} ({formatBytes(selectedFile.size)})
            </span>
            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2 bg-zinc-200 hover:bg-zinc-300 text-black rounded-xl text-xs font-semibold shadow-lg shadow-zinc-400/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload File"}
            </button>
          </div>
        )}
      </form>

      {/* File List Grid */}
      <div className="p-6 rounded-3xl bg-[#121212]/90 border border-zinc-800 space-y-4 shadow-xl">
        <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Workspace Files ({files.length})
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="w-6 h-6 text-zinc-400 animate-spin mx-auto mb-2" />
            <span className="text-xs text-zinc-400">Loading workspace files...</span>
          </div>
        ) : files.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-xs space-y-1">
            <FolderDown className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-zinc-300 font-semibold">No files uploaded yet.</p>
            <p className="text-[11px] text-zinc-500">Select a file above to store workspace images or PDFs.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((f) => {
              const imageType = isImage(f);
              return (
                <div
                  key={f.id}
                  className="p-4 rounded-2xl bg-[#050505]/70 border border-zinc-800/80 hover:border-zinc-500/40 transition-all flex flex-col justify-between space-y-3 group shadow-md"
                >
                  <div className="space-y-3">
                    {/* Media Thumbnail / Icon Preview */}
                    {imageType ? (
                      <div className="h-32 rounded-xl bg-[#121212] border border-zinc-800 overflow-hidden relative group-hover:border-zinc-500/30 transition-colors">
                        <Image
                          src={f.url}
                          alt={f.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          unoptimized
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-32 rounded-xl bg-[#121212]/90 border border-zinc-800 flex flex-col items-center justify-center space-y-2 text-rose-400">
                        <FileText className="w-10 h-10" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">PDF Document</span>
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-xs text-zinc-100 truncate" title={f.name}>{f.name}</h4>
                        <div className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-2">
                          <span>{formatBytes(f.size)}</span>
                          <span>•</span>
                          <span>{new Date(f.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteFile(f.id)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                        title="Delete File"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase bg-[#121212] px-2 py-0.5 rounded border border-zinc-800">
                      {f.mimeType?.split("/")[1] || "FILE"}
                    </span>
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-zinc-200/10 text-zinc-300 hover:bg-zinc-300 hover:text-black border border-zinc-500/30 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
