"use client";

import React, { useEffect, useState } from "react";
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
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";

export default function FilesPage() {
  const { currentWorkspace } = useWorkspace();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: "success" | "error" | "info", message: string) => {
    const id = Date.now().toString();
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
    } catch (err: any) {
      showToast("error", err.message || "Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
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
    } catch (err: any) {
      showToast("error", err.message || "File upload failed");
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
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete file");
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
  const isPdf = (f: FileItem) => f.mimeType === "application/pdf" || /\.pdf$/i.test(f.name);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FolderDown className="w-6 h-6 text-indigo-400" />
            <span>File Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Cloudinary asset storage for <span className="text-indigo-300 font-semibold">{currentWorkspace?.name || "Workspace"}</span> (JPG, PNG, PDF up to 5MB)
          </p>
        </div>
      </div>

      {/* Upload Drag/Select Zone */}
      <form
        onSubmit={handleUpload}
        className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 border-dashed hover:border-indigo-500/50 transition-colors flex flex-col items-center justify-center text-center space-y-3 shadow-xl"
      >
        <div className="p-3.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
          <UploadCloud className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Upload Asset or Document</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-0.5">
            Supported types: <span className="text-slate-300 font-semibold">JPG, JPEG, PNG, PDF</span> (Max 5 MB)
          </p>
        </div>

        <input
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={handleFileChange}
          className="text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 file:cursor-pointer transition-all"
        />

        {selectedFile && (
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <span className="text-xs font-semibold text-indigo-300 bg-indigo-950/40 px-3 py-1.5 rounded-xl border border-indigo-500/30">
              Selected: {selectedFile.name} ({formatBytes(selectedFile.size)})
            </span>
            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload File"}
            </button>
          </div>
        )}
      </form>

      {/* File List Grid */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Workspace Files ({files.length})
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mx-auto mb-2" />
            <span className="text-xs text-slate-400">Loading workspace files...</span>
          </div>
        ) : files.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs space-y-1">
            <FolderDown className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-slate-300 font-semibold">No files uploaded yet.</p>
            <p className="text-[11px] text-slate-500">Select a file above to store workspace images or PDFs.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((f) => {
              const imageType = isImage(f);
              const pdfType = isPdf(f);

              return (
                <div
                  key={f.id}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-3 group shadow-md"
                >
                  <div className="space-y-3">
                    {/* Media Thumbnail / Icon Preview */}
                    {imageType ? (
                      <div className="h-32 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden relative group-hover:border-indigo-500/30 transition-colors">
                        <img
                          src={f.url}
                          alt={f.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-32 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center space-y-2 text-rose-400">
                        <FileText className="w-10 h-10" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PDF Document</span>
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-xs text-white truncate" title={f.name}>{f.name}</h4>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>{formatBytes(f.size)}</span>
                          <span>•</span>
                          <span>{new Date(f.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteFile(f.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                        title="Delete File"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {f.mimeType?.split("/")[1] || "FILE"}
                    </span>
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
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
