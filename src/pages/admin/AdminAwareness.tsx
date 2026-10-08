import { FormEvent, useEffect, useRef, useState } from "react";
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
import {
  createAwarenessPost,
  deleteAwarenessPost,
  getAwarenessPosts,
  type AwarenessPost,
  type Language,
  updateAwarenessPost,
} from "../../api/awarenessApi";

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
  function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
    return (
      <img
        src="/safelink-logo.png"
        alt="SafeLink logo"
        className={`${className} object-contain`}
        draggable={false}
      />
    );
  }

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

  // Which post is expanded inline (Medium-style "Read more")
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  // Post pending deletion (custom confirm modal)
  const [postToDelete, setPostToDelete] = useState<AwarenessPost | null>(null);

  // Ref to the editor section so Edit can scroll right to the input
  const editorRef = useRef<HTMLDivElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  const currentLabels = labels[language];

  const fetchPosts = async () => {
    try {
      setPosts(await getAwarenessPosts());
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

  // When editing starts, scroll the editor into view and focus the title input
  useEffect(() => {
    if (editingPostId && editorRef.current) {
      // Small delay so the form renders with new values first
      requestAnimationFrame(() => {
        editorRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        // Then focus the title input after scroll settles
        window.setTimeout(() => {
          titleInputRef.current?.focus({ preventScroll: true });
        }, 450);
      });
    }
  }, [editingPostId]);

  const handleLanguageChange = (selectedLanguage: Language) => {
    setLanguage(selectedLanguage);
    setSuccess("");
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const payload = { language, title, content };
      const wasEditing = Boolean(editingPostId);

      if (editingPostId) {
        await updateAwarenessPost(editingPostId, payload);
      } else {
        await createAwarenessPost(payload);
      }

      setSuccess(
        wasEditing
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
    // Scroll is handled by the useEffect on editingPostId
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setTitle("");
    setContent("");
    setSuccess("");
    setError("");
  };

  // Open the custom confirm modal
  const requestDelete = (post: AwarenessPost) => {
    setPostToDelete(post);
  };

  // Cancel the delete confirmation
  const cancelDelete = () => {
    if (deletingPostId) return; // don't allow closing while deleting
    setPostToDelete(null);
  };

  // Confirm and actually delete
  const confirmDelete = async () => {
    if (!postToDelete) return;

    const postId = postToDelete._id;

    setDeletingPostId(postId);
    setSuccess("");
    setError("");

    try {
      await deleteAwarenessPost(postId);

      if (editingPostId === postId) {
        setEditingPostId(null);
        setTitle("");
        setContent("");
      }

      setSuccess("Awareness post deleted successfully.");

      setPostToDelete(null);

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

  /* Medium-style preview: first ~140 chars of the post */
  const getPreview = (text: string, limit = 140) => {
    const clean = text.replace(/\s+/g, " ").trim();
    if (clean.length <= limit) return clean;
    return clean.slice(0, limit).trimEnd() + "…";
  };

  return (
    <main className="min-h-screen bg-[#FAFBF7] text-[#173B28]">
      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FAFBF7] via-[#E7F1E3] to-[#E7F1E3] pt-32 pb-16 sm:pt-40 sm:pb-20">
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

      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
        {/* STATUS MESSAGES */}
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

        {/* =========================================================
            EDITOR
        ========================================================= */}
        <section ref={editorRef} className="scroll-mt-24">
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
            {/* LANGUAGE */}
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

            {/* TITLE */}
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
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={currentLabels.titlePlaceholder}
                required
                className="w-full rounded-2xl border border-[#2F8F4E]/40 bg-[#FAFBF7] px-5 py-3.5 text-base font-semibold text-[#173B28] outline-none placeholder:text-[#2F8F4E]/60 focus:border-[#2F8F4E] focus:ring-2 focus:ring-[#2F8F4E]/20"
              />
            </div>

            {/* CONTENT */}
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

            {/* ACTIONS */}
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

        {/* =========================================================
            POSTS — Medium-style cards
        ========================================================= */}
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
              {posts.map((post, index) => {
                const isExpanded = expandedPostId === post._id;
                const isEditing = editingPostId === post._id;

                return (
                  <article
                    key={post._id}
                    className={`group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 ${
                      isEditing
                        ? "border-[#176B3A] ring-2 ring-[#2F8F4E]/20"
                        : "border-[#E7F1E3] hover:-translate-y-1 hover:border-[#2F8F4E] hover:shadow-xl"
                    }`}
                  >
                    {/* Accent bar */}
                    <div className="h-1.5 bg-[#2F8F4E]" />

                    <div className="flex flex-1 flex-col p-6 sm:p-7">
                      {/* Top row: language chip + index */}
                      <div className="mb-5 flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E7F1E3] px-3 py-1 text-xs font-semibold text-[#2F8F4E]">
                          <Globe2 size={12} />
                          {getLanguageName(post.language)}
                        </span>

                        <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-[#2F8F4E] px-2.5 text-xs font-bold text-white">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold leading-7 text-[#176B3A] transition group-hover:text-[#2F8F4E] sm:text-2xl">
                        {post.title}
                      </h3>

                      {/* Date */}
                      <div className="mt-3 flex items-center gap-2 text-xs text-[#173B28]/60">
                        <CalendarDays size={13} />
                        <span>
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Divider */}
                      <div className="my-5 h-px bg-[#E7F1E3]" />

                      {/* Preview / full content */}
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

                      {/* Read more toggle */}
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

                      {/* Action row */}
                      <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#E7F1E3] pt-5">
                        <button
                          type="button"
                          onClick={() => handleEdit(post)}
                          className="inline-flex items-center gap-2 rounded-full border border-[#2F8F4E]/40 bg-white px-4 py-2 text-xs font-semibold text-[#2F8F4E] transition hover:-translate-y-0.5 hover:border-[#2F8F4E] hover:bg-[#FAFBF7] sm:text-sm"
                        >
                          <BookOpen size={14} />
                          {currentLabels.editButton}
                        </button>

                        <button
                          type="button"
                          onClick={() => requestDelete(post)}
                          disabled={deletingPostId === post._id}
                          className="inline-flex items-center gap-2 rounded-full border border-[#2F8F4E]/20 bg-white px-4 py-2 text-xs font-semibold text-[#2F8F4E] transition hover:-translate-y-0.5 hover:border-[#176B3A] hover:bg-[#E7F1E3] hover:text-[#176B3A] disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                        >
                          <Trash2 size={14} />
                          {deletingPostId === post._id
                            ? "..."
                            : currentLabels.deleteButton}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* =========================================================
            FOOTER NOTE
        ========================================================= */}
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

      {/* =========================================================
          CUSTOM DELETE CONFIRM MODAL
      ========================================================= */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#173B28]/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#E7F1E3] bg-white shadow-2xl">
            {/* Header */}
            <div className="border-b border-[#E7F1E3] px-6 py-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2F8F4E]">
                Confirmation required
              </p>

              <h2 className="mt-2 text-xl font-semibold text-[#176B3A]">
                Delete awareness post
              </h2>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              <p className="text-sm leading-6 text-[#173B28]/70">
                {currentLabels.deleteConfirm}
              </p>

              {/* Post preview inside modal */}
              <div className="mt-5 rounded-xl border border-[#2F8F4E]/20 bg-[#FAFBF7] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2F8F4E]">
                  {getLanguageName(postToDelete.language)}
                </p>

                <p className="mt-1 line-clamp-2 text-sm font-semibold text-[#176B3A]">
                  {postToDelete.title}
                </p>
              </div>

              <div className="mt-4 rounded-xl border border-[#2F8F4E]/30 bg-[#E7F1E3] px-4 py-3">
                <p className="text-xs leading-5 text-[#176B3A]">
                  This action cannot be undone. The post will be permanently
                  removed.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t border-[#E7F1E3] bg-[#FAFBF7] px-6 py-5">
              <button
                type="button"
                onClick={cancelDelete}
                disabled={deletingPostId === postToDelete._id}
                className="rounded-full border border-[#2F8F4E]/40 bg-white px-5 py-2.5 text-sm font-semibold text-[#2F8F4E] transition hover:border-[#2F8F4E] hover:bg-[#E7F1E3] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={deletingPostId === postToDelete._id}
                className="inline-flex items-center gap-2 rounded-full bg-[#2F8F4E] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#176B3A] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 size={14} />
                {deletingPostId === postToDelete._id
                  ? "Deleting..."
                  : "Delete post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}