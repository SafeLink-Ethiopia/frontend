import { ChangeEvent, FormEvent, useEffect, useState } from "react";

interface RagDocument {
  id: string;
  title: string;
  originalFileName: string;
  fileType: "pdf" | "docx";
  language: "en" | "am" | "om";
  category: string;
  status: "processing" | "ready" | "failed";
  errorMessage?: string;
  chunks: number;
  createdAt: string;
  updatedAt: string;
}

type Language = "en" | "am" | "om";

const API_URL = "http://localhost:5000/api/admin/rag/documents";

export default function AdminRag() {
  const [documents, setDocuments] = useState<RagDocument[]>([]);

  const [loadingDocuments, setLoadingDocuments] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showUploadForm, setShowUploadForm] = useState(false);

  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState<Language>("en");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);

  const [viewingId, setViewingId] = useState<string | null>(null);

  const [editingDocument, setEditingDocument] = useState<RagDocument | null>(
    null,
  );

  const [editTitle, setEditTitle] = useState("");
  const [editLanguage, setEditLanguage] = useState<Language>("en");
  const [editCategory, setEditCategory] = useState("");

  const [replacementFile, setReplacementFile] = useState<File | null>(null);

  const [updating, setUpdating] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getToken = () => {
    return localStorage.getItem("adminToken");
  };

  const fetchDocuments = async () => {
    try {
      setLoadingDocuments(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Admin authentication token not found.");
        return;
      }

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch documents.");
      }

      setDocuments(data.documents || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch documents.",
      );
    } finally {
      setLoadingDocuments(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;

    setFile(selectedFile);
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Please enter a document title.");
      return;
    }

    if (!category.trim()) {
      setError("Please enter a category.");
      return;
    }

    if (!file) {
      setError("Please select a PDF or DOCX file.");
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (extension !== "pdf" && extension !== "docx") {
      setError("Only PDF and DOCX files are allowed.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size cannot exceed 10 MB.");
      return;
    }

    const formData = new FormData();

    formData.append("title", title.trim());

    formData.append("language", language);

    formData.append("category", category.trim());

    formData.append("file", file);

    try {
      setUploading(true);

      const token = getToken();

      if (!token) {
        setError("Admin authentication token not found.");
        return;
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload document.");
      }

      setSuccess(data.message || "Document uploaded successfully.");

      setTitle("");
      setLanguage("en");
      setCategory("");
      setFile(null);

      const fileInput = document.getElementById(
        "upload-file",
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      setShowUploadForm(false);

      await fetchDocuments();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload document.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleView = async (documentId: string) => {
    try {
      setError("");
      setSuccess("");
      setViewingId(documentId);

      const token = getToken();

      if (!token) {
        setError("Admin authentication token not found.");
        return;
      }

      const response = await fetch(`${API_URL}/${documentId}/file`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let message = "Failed to open document.";

        try {
          const data = await response.json();

          message = data.message || message;
        } catch {
          // Response was not JSON.
        }

        throw new Error(message);
      }

      const blob = await response.blob();

      const fileUrl = URL.createObjectURL(blob);

      window.open(fileUrl, "_blank", "noopener,noreferrer");

      setTimeout(() => {
        URL.revokeObjectURL(fileUrl);
      }, 60000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open document.");
    } finally {
      setViewingId(null);
    }
  };

  const handleEdit = (document: RagDocument) => {
    setEditingDocument(document);

    setEditTitle(document.title);

    setEditLanguage(document.language);

    setEditCategory(document.category);

    setReplacementFile(null);

    setError("");
    setSuccess("");
  };

  const handleReplacementFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;

    setReplacementFile(selectedFile);
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();

    if (!editingDocument) {
      return;
    }

    setError("");
    setSuccess("");

    if (!editTitle.trim()) {
      setError("Document title cannot be empty.");
      return;
    }

    if (!editCategory.trim()) {
      setError("Category cannot be empty.");
      return;
    }

    if (replacementFile) {
      const extension = replacementFile.name.split(".").pop()?.toLowerCase();

      if (extension !== "pdf" && extension !== "docx") {
        setError("Replacement file must be PDF or DOCX.");
        return;
      }

      if (replacementFile.size > 10 * 1024 * 1024) {
        setError("Replacement file cannot exceed 10 MB.");
        return;
      }
    }

    const formData = new FormData();

    formData.append("title", editTitle.trim());

    formData.append("language", editLanguage);

    formData.append("category", editCategory.trim());

    if (replacementFile) {
      formData.append("file", replacementFile);
    }

    try {
      setUpdating(true);

      const token = getToken();

      if (!token) {
        setError("Admin authentication token not found.");
        return;
      }

      const response = await fetch(`${API_URL}/${editingDocument.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update document.");
      }

      setSuccess(data.message || "Document updated successfully.");

      setEditingDocument(null);
      setReplacementFile(null);

      await fetchDocuments();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update document.",
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document? This will also delete its chunks and embeddings.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");
      setDeletingId(documentId);

      const token = getToken();

      if (!token) {
        setError("Admin authentication token not found.");
        return;
      }

      const response = await fetch(`${API_URL}/${documentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete document.");
      }

      setSuccess(data.message || "Document deleted successfully.");

      await fetchDocuments();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete document.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getLanguageLabel = (value: Language) => {
    switch (value) {
      case "en":
        return "English";

      case "am":
        return "Amharic";

      case "om":
        return "Afaan Oromo";

      default:
        return value;
    }
  };

  const getStatusClasses = (status: RagDocument["status"]) => {
    switch (status) {
      case "ready":
        return "bg-green-100 text-green-700";

      case "processing":
        return "bg-yellow-100 text-yellow-700";

      case "failed":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">RAG Documents</h1>

            <p className="mt-2 text-gray-600">
              Manage documents used by the SafeLink assistant.
            </p>
          </div>

          <button
            onClick={() => {
              setShowUploadForm(!showUploadForm);

              setError("");
              setSuccess("");
            }}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            {showUploadForm ? "Close Upload" : "+ Upload Document"}
          </button>
        </div>

        {/* SUCCESS */}

        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
            {success}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* UPLOAD FORM */}

        {showUploadForm && (
          <div className="mb-8 rounded-xl bg-white p-8 shadow">
            <h2 className="mb-6 text-xl font-bold text-gray-900">
              Upload New Document
            </h2>

            <form onSubmit={handleUpload} className="space-y-6">
              <div>
                <label
                  htmlFor="upload-title"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Document Title
                </label>

                <input
                  id="upload-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Consent Guide"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="upload-language"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Document Language
                </label>

                <select
                  id="upload-language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="en">English</option>

                  <option value="am">Amharic</option>

                  <option value="om">Afaan Oromo</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="upload-category"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Category
                </label>

                <input
                  id="upload-category"
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Consent"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="upload-file"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Document File
                </label>

                <input
                  id="upload-file"
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3"
                />

                <p className="mt-2 text-sm text-gray-500">
                  PDF or DOCX. Maximum size: 10 MB.
                </p>

                {file && (
                  <p className="mt-2 text-sm text-gray-700">
                    Selected: <strong>{file.name}</strong>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? "Uploading and processing..." : "Upload Document"}
              </button>
            </form>
          </div>
        )}

        {/* DOCUMENT TABLE */}

        <div className="rounded-xl bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-5">
            <h2 className="text-xl font-bold text-gray-900">Knowledge Base</h2>

            <p className="mt-1 text-sm text-gray-500">
              {documents.length} document
              {documents.length !== 1 ? "s" : ""}
            </p>
          </div>

          {loadingDocuments ? (
            <div className="p-10 text-center text-gray-500">
              Loading documents...
            </div>
          ) : documents.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-gray-500">
                No RAG documents have been uploaded yet.
              </p>

              <button
                onClick={() => setShowUploadForm(true)}
                className="mt-4 rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700"
              >
                Upload Your First Document
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left text-sm text-gray-600">
                    <th className="px-6 py-4 font-semibold">Document</th>

                    <th className="px-6 py-4 font-semibold">Language</th>

                    <th className="px-6 py-4 font-semibold">Category</th>

                    <th className="px-6 py-4 font-semibold">Status</th>

                    <th className="px-6 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {documents.map((document) => (
                    <tr
                      key={document.id}
                      className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                    >
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {document.title}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {document.originalFileName}
                          </p>

                          <span className="mt-2 inline-block rounded bg-gray-100 px-2 py-1 text-xs uppercase text-gray-600">
                            {document.fileType}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm text-gray-700">
                        {getLanguageLabel(document.language)}
                      </td>

                      <td className="px-6 py-5 text-sm text-gray-700">
                        {document.category}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                            document.status,
                          )}`}
                        >
                          {document.status}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleView(document.id)}
                            disabled={viewingId === document.id}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {viewingId === document.id ? "Opening..." : "View"}
                          </button>

                          <button
                            onClick={() => handleEdit(document)}
                            className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(document.id)}
                            disabled={deletingId === document.id}
                            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingId === document.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* EDIT MODAL */}

      {editingDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Edit Document
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingDocument.originalFileName}
                </p>
              </div>

              <button
                onClick={() => setEditingDocument(null)}
                className="rounded-lg px-3 py-2 text-xl text-gray-500 hover:bg-gray-100"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6 p-6">
              <div>
                <label
                  htmlFor="edit-title"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Document Title
                </label>

                <input
                  id="edit-title"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-language"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Language
                </label>

                <select
                  id="edit-language"
                  value={editLanguage}
                  onChange={(e) => setEditLanguage(e.target.value as Language)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="en">English</option>

                  <option value="am">Amharic</option>

                  <option value="om">Afaan Oromo</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="edit-category"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Category
                </label>

                <input
                  id="edit-category"
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <label
                  htmlFor="replacement-file"
                  className="mb-2 block text-sm font-medium text-gray-800"
                >
                  Replace Document File
                  <span className="ml-2 font-normal text-gray-500">
                    (optional)
                  </span>
                </label>

                <input
                  id="replacement-file"
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleReplacementFileChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3"
                />

                <p className="mt-2 text-sm text-gray-600">
                  Leave empty if you only want to edit the metadata. Replacing
                  the file will regenerate its chunks and embeddings.
                </p>

                {replacementFile && (
                  <p className="mt-2 text-sm font-medium text-gray-800">
                    New file: {replacementFile.name}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingDocument(null)}
                  className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updating}
                  className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updating
                    ? replacementFile
                      ? "Replacing & processing..."
                      : "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
