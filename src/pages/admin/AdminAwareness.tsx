import { FormEvent, useEffect, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  FileText,
  Globe2,
  Plus,
  Trash2,
} from "lucide-react";

type Language = "en" | "am" | "om";

interface LanguageLabels {
  language: string;
  title: string;
  content: string;
  titlePlaceholder: string;
  contentPlaceholder: string;
  createButton: string;
  updateButton: string;
  creatingButton: string;
  updatingButton: string;
  backButton: string;
  pageTitle: string;
  pageDescription: string;
  editButton: string;
  deleteButton: string;
  cancelButton: string;
  postsTitle: string;
  postsDescription: string;
  loadingPosts: string;
  noPosts: string;
  deleteConfirm: string;
}

interface AwarenessPost {
  _id: string;
  language: Language;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

const labels: Record<Language, LanguageLabels> = {
  en: {
    language: "Language",
    title: "Title",
    content: "Content",
    titlePlaceholder: "Enter title",
    contentPlaceholder: "Enter awareness content",
    createButton: "Create Awareness Post",
    updateButton: "Update Awareness Post",
    creatingButton: "Creating Post...",
    updatingButton: "Updating Post...",
    backButton: "Back to Dashboard",
    pageTitle: "Create Awareness Post",
    pageDescription: "Create an awareness post in your selected language.",
    editButton: "Edit",
    deleteButton: "Delete",
    cancelButton: "Cancel",
    postsTitle: "Awareness Posts",
    postsDescription: "Posts created by the administrator.",
    loadingPosts: "Loading posts...",
    noPosts: "No awareness posts have been created yet.",
    deleteConfirm: "Are you sure you want to delete this awareness post?",
  },

  am: {
    language: "ቋንቋ",
    title: "ርዕስ",
    content: "ይዘት",
    titlePlaceholder: "ርዕስ ያስገቡ",
    contentPlaceholder: "የግንዛቤ ይዘት ያስገቡ",
    createButton: "የግንዛቤ ልጥፍ ይፍጠሩ",
    updateButton: "የግንዛቤ ልጥፍ ያዘምኑ",
    creatingButton: "በመፍጠር ላይ...",
    updatingButton: "በማዘመን ላይ...",
    backButton: "ወደ ዳሽቦርድ ተመለስ",
    pageTitle: "የግንዛቤ ልጥፍ ይፍጠሩ",
    pageDescription: "በመረጡት ቋንቋ የግንዛቤ ልጥፍ ይፍጠሩ።",
    editButton: "አርትዕ",
    deleteButton: "ሰርዝ",
    cancelButton: "ሰርዝ",
    postsTitle: "የግንዛቤ ልጥፎች",
    postsDescription: "በአስተዳዳሪው የተፈጠሩ ልጥፎች።",
    loadingPosts: "ልጥፎችን በመጫን ላይ...",
    noPosts: "እስካሁን ምንም የግንዛቤ ልጥፍ አልተፈጠረም።",
    deleteConfirm: "ይህን የግንዛቤ ልጥፍ መሰረዝ ይፈልጋሉ?",
  },

  om: {
    language: "Afaan",
    title: "Mata-duree",
    content: "Qabiyyee",
    titlePlaceholder: "Mata-duree galchi",
    contentPlaceholder: "Qabiyyee hubannoo galchi",
    createButton: "Barreeffama Hubannoo Uumi",
    updateButton: "Barreeffama Hubannoo Haaromsi",
    creatingButton: "Uumaa jira...",
    updatingButton: "Haaromsaa jira...",
    backButton: "Gara Dashboard Deebi'i",
    pageTitle: "Barreeffama Hubannoo Uumi",
    pageDescription: "Afaan filatte keessatti barreeffama hubannoo uumi.",
    editButton: "Gulaali",
    deleteButton: "Haqi",
    cancelButton: "Dhiisi",
    postsTitle: "Barreeffamoota Hubannoo",
    postsDescription: "Barreeffamoota bulchaan uume.",
    loadingPosts: "Barreeffamoota fe'aa jira...",
    noPosts: "Hanga ammaatti barreeffamni hubannoo hin uumamne.",
    deleteConfirm: "Barreeffama hubannoo kana haquu barbaaddaa?",
  },
};

export default function AdminAwareness() {
  const [language, setLanguage] = useState<Language>("en");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [posts, setPosts] = useState<AwarenessPost[]>([]);

  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(true);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  // Which post's ⋮ menu is open
  const [menuPostId, setMenuPostId] = useState<string | null>(null);

  const currentLabels = labels[language];

  const fetchPosts = async () => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      setError("Admin authentication required.");
      setPostsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/awareness-posts",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch awareness posts.");
      }

      setPosts(data.posts);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch awareness posts.",
      );
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLanguageChange = (selectedLanguage: Language) => {
    setLanguage(selectedLanguage);
    setTitle("");
    setContent("");
    setEditingPostId(null);
    setSuccess("");
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    const token = localStorage.getItem("adminToken");

    if (!token) {
      setError("Admin authentication required.");
      setLoading(false);
      return;
    }

    try {
      const url = editingPostId
        ? `http://localhost:5000/api/admin/awareness-posts/${editingPostId}`
        : "http://localhost:5000/api/admin/awareness-posts";

      const response = await fetch(url, {
        method: editingPostId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          language,
          title,
          content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save awareness post.");
      }

      setSuccess(
        editingPostId
          ? "Awareness post updated successfully."
          : "Awareness post created successfully.",
      );

      setTitle("");
      setContent("");
      setEditingPostId(null);

      await fetchPosts();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to save awareness post.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post: AwarenessPost) => {
    setEditingPostId(post._id);
    setLanguage(post.language);
    setTitle(post.title);
    setContent(post.content);
    setSuccess("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setTitle("");
    setContent("");
    setSuccess("");
    setError("");
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm(currentLabels.deleteConfirm)) {
      return;
    }

    const token = localStorage.getItem("adminToken");

    if (!token) {
      setError("Admin authentication required.");
      return;
    }

    setDeletingPostId(postId);
    setSuccess("");
    setError("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/awareness-posts/${postId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete awareness post.");
      }

      if (editingPostId === postId) {
        setEditingPostId(null);
        setTitle("");
        setContent("");
      }

      setSuccess("Awareness post deleted successfully.");

      await fetchPosts();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete awareness post.",
      );
    } finally {
      setDeletingPostId(null);
    }
  };

  const getLanguageName = (postLanguage: Language) => {
    if (postLanguage === "am") {
      return "አማርኛ";
    }

    if (postLanguage === "om") {
      return "Afaan Oromoo";
    }

    return "English";
  };

  const getPreview = (text: string, limit = 140) => {
    const clean = text.replace(/\s+/g, " ").trim();
    if (clean.length <= limit) return clean;
    return clean.slice(0, limit).trimEnd() + "…";
  };

  return (
    <main className="min-h-screen bg-[#FAFBF7] text-[#173B28]">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FAFBF7] via-[#E7F1E3] to-[#E7F1E3] pt-16 pb-16 sm:pt-20 sm:pb-20">
        <div className="pointer-events-none absolute -right-24 top-20 h-96 w-96 rounded-full bg-[#2F8F4E]/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-[#2F8F4E]/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-5 text-center sm:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#2F8F4E]/30 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-[#2F8F4E] backdrop-blur-md">
            SafeLink Administration
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#176B3A] sm:text-4xl lg:text-5xl">
            {editingPostId
              ? "Edit Awareness Post"
              : currentLabels.pageTitle}
          </h1>

          <div className="mx-auto mt-6 h-1 w-20 rounded-full bg-[#2F8F4E]" />

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#173B28]/75 sm:text-base sm:leading-8">
            {currentLabels.pageDescription}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
        {(success || error) && (
          <div className="mb-10 space-y-3">
            {success && (
              <div className="flex items-start gap-3 rounded-2xl border border-[#2F8F4E]/30 bg-white p-4 shadow-sm">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2F8F4E] text-xs font-bold text-white">
                  ✓
                </span>
                <p className="text-sm font-medium text-[#176B3A]">{success}</p>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-[#2F8F4E]/30 bg-white p-4 shadow-sm">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#176B3A] text-xs font-bold text-white">
                  !
                </span>
                <p className="text-sm font-medium text-[#176B3A]">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* EDITOR */}
        <section>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2F8F4E]">
                {editingPostId ? "Editing" : "New publication"}
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-[#176B3A] sm:text-3xl">
                {editingPostId
                  ? "Update awareness content"
                  : "Write an awareness post"}
              </h2>
            </div>

            {editingPostId && (
              <span className="inline-flex items-center gap-2 rounded-full border border-[#2F8F4E]/30 bg-[#E7F1E3] px-3.5 py-1.5 text-xs font-semibold text-[#2F8F4E]">
                <Plus size={13} />
                Editing post
              </span>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-2xl border border-[#2F8F4E]/30 bg-white shadow-lg"
          >
            <div className="grid gap-6 border-b border-[#E7F1E3] p-6 sm:grid-cols-[180px_1fr] sm:p-7">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E7F1E3]">
                  <Globe2 size={17} className="text-[#2F8F4E]" />
                </div>

                <label
                  htmlFor="language"
                  className="pt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#2F8F4E]"
                >
                  {currentLabels.language}
                </label>
              </div>

              <select
                id="language"
                value={language}
                onChange={(event) =>
                  handleLanguageChange(event.target.value as Language)
                }
                className="w-full max-w-sm rounded-full border border-[#2F8F4E]/40 bg-[#FAFBF7] px-5 py-3 text-sm font-medium text-[#173B28] outline-none transition focus:border-[#2F8F4E] focus:ring-2 focus:ring-[#2F8F4E]/20"
              >
                <option value="en">English</option>
                <option value="am">አማርኛ</option>
                <option value="om">Afaan Oromoo</option>
              </select>
            </div>

            <div className="grid gap-6 border-b border-[#E7F1E3] p-6 sm:grid-cols-[180px_1fr] sm:p-7">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E7F1E3]">
                  <BookOpen size={17} className="text-[#2F8F4E]" />
                </div>

                <label
                  htmlFor="title"
                  className="pt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#2F8F4E]"
                >
                  {currentLabels.title}
                </label>
              </div>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={currentLabels.titlePlaceholder}
                required
                className="w-full rounded-2xl border border-[#2F8F4E]/40 bg-[#FAFBF7] px-5 py-3.5 text-base font-semibold text-[#173B28] outline-none placeholder:text-[#2F8F4E]/60 focus:border-[#2F8F4E] focus:ring-2 focus:ring-[#2F8F4E]/20"
              />
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-[180px_1fr] sm:p-7">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E7F1E3]">
                  <FileText size={17} className="text-[#2F8F4E]" />
                </div>

                <label
                  htmlFor="content"
                  className="pt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#2F8F4E]"
                >
                  {currentLabels.content}
                </label>
              </div>

              <textarea
                id="content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder={currentLabels.contentPlaceholder}
                rows={12}
                required
                className="w-full resize-y rounded-2xl border border-[#2F8F4E]/40 bg-[#FAFBF7] px-5 py-4 text-sm leading-7 text-[#173B28] outline-none placeholder:text-[#2F8F4E]/60 focus:border-[#2F8F4E] focus:ring-2 focus:ring-[#2F8F4E]/20"
              />
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#E7F1E3] bg-[#FAFBF7] px-6 py-5 sm:flex-row sm:justify-end sm:px-7">
              {editingPostId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="rounded-full border border-[#2F8F4E]/40 bg-white px-6 py-3 text-sm font-semibold text-[#2F8F4E] transition hover:border-[#2F8F4E] hover:bg-[#FAFBF7]"
                >
                  {currentLabels.cancelButton}
                </button>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2F8F4E] px-7 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#176B3A] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus size={16} />
                {loading
                  ? editingPostId
                    ? currentLabels.updatingButton
                    : currentLabels.creatingButton
                  : editingPostId
                    ? currentLabels.updateButton
                    : currentLabels.createButton}
              </button>
            </div>
          </form>
        </section>

        {/* POSTS */}
        <section className="mt-20">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2F8F4E]">
                Published content
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-[#176B3A] sm:text-3xl">
                {currentLabels.postsTitle}
              </h2>

              <p className="mt-2 text-sm text-[#173B28]/65">
                {currentLabels.postsDescription}
              </p>
            </div>

            <span className="inline-flex items-center gap-2 self-start rounded-full bg-[#E7F1E3] px-3.5 py-1.5 text-xs font-medium text-[#2F8F4E] sm:self-auto">
              <BookOpen size={13} />
              {posts.length} {posts.length === 1 ? "post" : "posts"}
            </span>
          </div>

          {postsLoading ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-[#2F8F4E]/30 bg-white shadow-sm">
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E7F1E3]">
                  <BookOpen
                    size={22}
                    className="animate-pulse text-[#2F8F4E]"
                  />
                </div>

                <div className="text-center">
                  <p className="text-sm font-semibold text-[#176B3A]">
                    {currentLabels.loadingPosts}
                  </p>

                  <p className="mt-1 text-xs text-[#173B28]/60">
                    Please wait while we fetch the latest content.
                  </p>
                </div>
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-[#2F8F4E]/30 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E7F1E3]">
                <BookOpen size={25} className="text-[#2F8F4E]" />
              </div>

              <h3 className="text-lg font-semibold text-[#176B3A]">
                {currentLabels.noPosts}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#173B28]/65">
                Create your first awareness publication using the editor
                above.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {posts.map((post) => {
                const isExpanded = expandedPostId === post._id;
                const isEditing = editingPostId === post._id;
                const isMenuOpen = menuPostId === post._id;
                const isDeleting = deletingPostId === post._id;

                return (
                  <article
                    key={post._id}
                    className={`group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 ${
                      isEditing
                        ? "border-[#176B3A] ring-2 ring-[#2F8F4E]/20"
                        : "border-[#E7F1E3] hover:-translate-y-1 hover:border-[#2F8F4E] hover:shadow-xl"
                    }`}
                  >
                    <div className="h-1.5 bg-[#2F8F4E]" />

                    <div className="flex flex-1 flex-col p-6 sm:p-7">
                      {/* Top row: language chip + ⋮ menu */}
                      <div className="mb-5 flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E7F1E3] px-3 py-1 text-xs font-semibold text-[#2F8F4E]">
                          <Globe2 size={12} />
                          {getLanguageName(post.language)}
                        </span>

                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setMenuPostId((current) =>
                                current === post._id ? null : post._id,
                              )
                            }
                            aria-label="Post actions"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E7F1E3] text-lg leading-none text-[#2F8F4E] transition hover:border-[#2F8F4E] hover:bg-[#E7F1E3]"
                          >
                            ⋮
                          </button>

                          {isMenuOpen && (
                            <>
                              <button
                                type="button"
                                aria-label="Close menu"
                                onClick={() => setMenuPostId(null)}
                                className="fixed inset-0 z-20 cursor-default"
                              />

                              <div className="absolute right-0 top-11 z-30 w-40 overflow-hidden rounded-2xl border border-[#E7F1E3] bg-white shadow-2xl">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMenuPostId(null);
                                    handleEdit(post);
                                  }}
                                  className="w-full px-4 py-3 text-left text-sm text-[#176B3A] transition hover:bg-[#FAFBF7]"
                                >
                                  {currentLabels.editButton}
                                </button>

                                <button
                                  type="button"
                                  disabled={isDeleting}
                                  onClick={() => {
                                    setMenuPostId(null);
                                    handleDelete(post._id);
                                  }}
                                  className="w-full px-4 py-3 text-left text-sm font-medium text-[#8B1F1F] transition hover:bg-[#F7EBEB] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isDeleting
                                    ? "..."
                                    : currentLabels.deleteButton}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <h3 className="text-xl font-bold leading-7 text-[#176B3A] transition group-hover:text-[#2F8F4E] sm:text-2xl">
                        {post.title}
                      </h3>

                      <div className="mt-3 flex items-center gap-2 text-xs text-[#173B28]/60">
                        <CalendarDays size={13} />
                        <span>
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="my-5 h-px bg-[#E7F1E3]" />

                      <div className="flex-1">
                        {isExpanded ? (
                          <div className="whitespace-pre-wrap text-sm leading-7 text-[#173B28]/75">
                            {post.content}
                          </div>
                        ) : (
                          <p className="text-sm leading-7 text-[#173B28]/70">
                            {getPreview(post.content)}
                          </p>
                        )}
                      </div>

                      {!isExpanded && (
                        <button
                          type="button"
                          onClick={() => setExpandedPostId(post._id)}
                          className="mt-4 inline-flex items-center gap-1 self-start text-xs font-semibold text-[#2F8F4E] underline underline-offset-4 transition hover:text-[#176B3A]"
                        >
                          Read more
                          <ChevronRight size={13} />
                        </button>
                      )}

                      {isExpanded && (
                        <button
                          type="button"
                          onClick={() => setExpandedPostId(null)}
                          className="mt-4 inline-flex items-center gap-1 self-start text-xs font-semibold text-[#2F8F4E] underline underline-offset-4 transition hover:text-[#176B3A]"
                        >
                          Show less
                          <ChevronDown size={13} />
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <footer className="mt-16 border-t border-[#2F8F4E]/20 pt-8">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E7F1E3] text-xs font-bold text-[#2F8F4E]">
              ✓
            </span>

            <p className="text-xs leading-6 text-[#173B28]/60">
              Awareness publications are managed by SafeLink administrators
              and made available to users according to their selected
              language.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}