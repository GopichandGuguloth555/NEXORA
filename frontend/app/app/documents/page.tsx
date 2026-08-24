"use client";

import React, { useEffect, useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { documentService } from "@/lib/services/document.service";
import { DocumentItem } from "@/lib/types";
import { ToastContainer, ToastMessage } from "@/components/ui/Toast";
import {
  FileText,
  Plus,
  Trash2,
  Edit3,
  X,
  Loader2,
  Save,
  Clock,
  User as UserIcon,
  Search,
  BookOpen,
} from "lucide-react";

export default function DocumentsPage() {
  const { currentWorkspace } = useWorkspace();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Editor State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [creating, setCreating] = useState(false);

  const showToast = (type: "success" | "error" | "info", message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchDocuments = async () => {
    if (!currentWorkspace) return;
    try {
      setLoading(true);
      const res = await documentService.getDocuments(currentWorkspace.id);
      const docs = res.data || [];
      setDocuments(docs);
      if (docs.length > 0 && !selectedDoc) {
        selectDocument(docs[0]);
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const selectDocument = (doc: DocumentItem) => {
    setSelectedDoc(doc);
    setTitle(doc.title);
    setContent(doc.content);
    setIsEditing(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, [currentWorkspace]);

  const handleSaveDoc = async () => {
    if (!selectedDoc) return;
    if (title.trim().length < 3) {
      showToast("error", "Document title must be at least 3 characters");
      return;
    }
    if (!content.trim()) {
      showToast("error", "Document content cannot be empty");
      return;
    }

    try {
      setSaving(true);
      const res = await documentService.updateDocument(selectedDoc.id, {
        title: title.trim(),
        content: content.trim(),
      });
      if (res.success && res.data) {
        setSelectedDoc(res.data);
        setIsEditing(false);
        showToast("success", "Document updated successfully");
        await fetchDocuments();
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to update document");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace) return;

    if (newTitle.trim().length < 3) {
      showToast("error", "Document title must be at least 3 characters");
      return;
    }

    try {
      setCreating(true);
      const res = await documentService.createDocument(currentWorkspace.id, {
        title: newTitle.trim(),
        content: newContent.trim() || `# ${newTitle.trim()}\n\nWrite documentation here...`,
      });

      if (res.success && res.data) {
        showToast("success", "Document created successfully");
        setNewTitle("");
        setNewContent("");
        setIsCreateOpen(false);
        await fetchDocuments();
        selectDocument(res.data);
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to create document");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      await documentService.deleteDocument(id);
      showToast("success", "Document deleted");
      if (selectedDoc?.id === id) {
        setSelectedDoc(null);
      }
      await fetchDocuments();
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete document");
    }
  };

  const filteredDocs = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.createdBy?.name && d.createdBy.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!currentWorkspace) {
    return (
      <div className="p-12 text-center bg-[#121212]/70 rounded-2xl border border-zinc-800 space-y-4 max-w-md mx-auto my-12">
        <FileText className="w-10 h-10 text-zinc-500 mx-auto" />
        <h2 className="text-lg font-bold text-zinc-100">No Workspace Selected</h2>
        <p className="text-xs text-zinc-400">Please select or create a workspace to access documents.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-400" />
            <span>Workspace Documents</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Knowledge base, project specs, and guides for <span className="text-zinc-300 font-semibold">{currentWorkspace.name}</span>
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 bg-zinc-200 hover:bg-zinc-300 text-black rounded-xl text-sm font-medium shadow-lg shadow-zinc-400/20 flex items-center gap-2 cursor-pointer transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Document</span>
        </button>
      </div>

      {/* Search & Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Document List & Search Column */}
        <div className="lg:col-span-4 space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full bg-[#121212] border border-zinc-800 focus:border-zinc-400 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-600 outline-none transition-colors"
            />
          </div>

          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 px-1 pt-1 flex items-center justify-between">
            <span>Documents ({filteredDocs.length})</span>
          </div>

          {loading ? (
            <div className="py-12 text-center bg-[#121212]/70 rounded-2xl border border-zinc-800">
              <Loader2 className="w-5 h-5 text-zinc-400 animate-spin mx-auto" />
            </div>
          ) : filteredDocs.length === 0 ? (
            /* Explicit Required Empty State */
            <div className="p-8 text-center bg-[#121212]/70 rounded-2xl border border-zinc-800 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-100">No documents yet</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Create your first project document to keep your team's knowledge organized.
              </p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-3 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-black rounded-xl text-xs font-medium cursor-pointer transition-all"
              >
                Create First Document
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
              {filteredDocs.map((doc) => {
                const isSelected = selectedDoc?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => selectDocument(doc)}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between group ${
                      isSelected
                        ? "bg-zinc-200/10 border-zinc-500/50 shadow-md"
                        : "bg-[#121212]/90 hover:bg-[#121212] border-zinc-800/80"
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText className={`w-5 h-5 shrink-0 ${isSelected ? "text-zinc-400" : "text-amber-400"}`} />
                      <div className="overflow-hidden">
                        <div className={`font-semibold text-sm truncate ${isSelected ? "text-zinc-200" : "text-zinc-100"}`}>
                          {doc.title}
                        </div>
                        <div className="text-[11px] text-zinc-400 flex items-center gap-2">
                          <span>{doc.createdBy?.name || "Member"}</span>
                          <span>•</span>
                          <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDoc(doc.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-opacity"
                      title="Delete Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Document Editor / View Panel */}
        <div className="lg:col-span-8">
          {selectedDoc ? (
            <div className="p-6 rounded-3xl bg-[#121212]/95 border border-zinc-800 space-y-6 flex flex-col min-h-[550px] shadow-2xl">
              {/* Editor Topbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Document Title"
                    className="text-xl font-bold bg-[#050505]/80 border border-zinc-800 focus:border-zinc-400 rounded-xl px-4 py-2 text-zinc-100 outline-none flex-1"
                  />
                ) : (
                  <div>
                    <h2 className="text-xl font-bold text-zinc-100">{selectedDoc.title}</h2>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                      <span className="flex items-center gap-1">
                        <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
                        {selectedDoc.createdBy?.name || "Workspace Member"}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        Updated {new Date(selectedDoc.updatedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 shrink-0">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-2 text-xs text-zinc-400 hover:text-zinc-100"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveDoc}
                        disabled={saving}
                        className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-black rounded-xl text-xs font-semibold shadow-md shadow-zinc-400/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Edit3 className="w-4 h-4 text-zinc-400" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDoc(selectedDoc.id)}
                        className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1">
                {isEditing ? (
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={18}
                    className="w-full bg-[#050505]/70 border border-zinc-800 focus:border-zinc-400 rounded-2xl p-5 text-sm text-zinc-100 font-mono leading-relaxed outline-none resize-none"
                    placeholder="Write document content..."
                  />
                ) : (
                  <div className="prose prose-invert max-w-none text-sm leading-relaxed text-zinc-200 whitespace-pre-wrap font-sans bg-[#050505]/40 border border-zinc-800/60 rounded-2xl p-6">
                    {selectedDoc.content}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-16 text-center bg-[#121212]/70 rounded-3xl border border-zinc-800 text-zinc-400 text-sm space-y-2">
              <BookOpen className="w-8 h-8 text-zinc-600 mx-auto" />
              <p>Select a document from the list to view or edit knowledge content.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Document Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050505]/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#121212] border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <span>Create Document</span>
              </h2>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. E-Commerce Project Requirements"
                  required
                  minLength={3}
                  className="w-full bg-[#050505]/60 border border-zinc-800 focus:border-zinc-400 rounded-xl px-4 py-2.5 text-sm text-zinc-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1">
                  Document Content *
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Requirements and project planning documentation..."
                  rows={6}
                  className="w-full bg-[#050505]/60 border border-zinc-800 focus:border-zinc-400 rounded-xl p-4 text-sm text-zinc-100 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-zinc-200 hover:bg-zinc-300 text-black text-sm font-medium rounded-xl shadow-lg shadow-zinc-400/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Document"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
