import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

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

  return (
    <main className="min-h-screen bg-[#f7f5f6] text-[#3e1919]">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
        {/* PAGE HEADER */}
        <header className="border-b border-[#a79093]/30 pb-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#a79093]">
                SafeLink Administration
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-[#3e1919] sm:text-4xl">
                {editingPostId
                  ? "Edit Awareness Post"
                  : currentLabels.pageTitle}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#a79093]">
                {currentLabels.pageDescription}
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/admin/dashboard")}
              className="self-start border border-[#a79093]/40 bg-transparent px-5 py-2.5 text-sm font-semibold text-[#3e1919] transition hover:bg-[#f0e2d6] sm:self-auto"
            >
              ← {currentLabels.backButton}
            </button>
          </div>
        </header>

        {/* STATUS MESSAGES */}
        {(success || error) && (
          <div className="mt-6">
            {success && (
              <div className="border-l-4 border-[#3e1919] bg-[#f0e2d6] px-5 py-4">
                <p className="text-sm font-medium text-[#3e1919]">
                  {success}
                </p>
              </div>
            )}

            {error && (
              <div className="mt-3 border-l-4 border-[#3e1919] bg-[#f0e2d6] px-5 py-4">
                <p className="text-sm font-medium text-[#3e1919]">
                  {error}
                </p>
              </div>
            )}
          </div>
        )}

        {/* EDITOR */}
        <section className="mt-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a79093]">
                {editingPostId ? "Editing" : "New publication"}
              </p>

              <h2 className="mt-1 text-xl font-bold text-[#3e1919]">
                {editingPostId
                  ? "Update awareness content"
                  : "Write an awareness post"}
              </h2>
            </div>

            {editingPostId && (
              <span className="border border-[#a79093]/40 bg-[#f0e2d6] px-3 py-1.5 text-xs font-semibold text-[#3e1919]">
                Editing post
              </span>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-y border-[#a79093]/30 bg-white"
          >
            {/* LANGUAGE */}
            <div className="grid border-b border-[#a79093]/25 sm:grid-cols-[180px_1fr]">
              <div className="border-b border-[#a79093]/25 bg-[#f7f5f6] px-5 py-4 sm:border-b-0 sm:border-r">
                <label
                  htmlFor="language"
                  className="text-xs font-semibold uppercase tracking-[0.12em] text-[#a79093]"
                >
                  {currentLabels.language}
                </label>
              </div>

              <div className="px-5 py-4">
                <select
                  id="language"
                  value={language}
                  onChange={(event) =>
                    handleLanguageChange(
                      event.target.value as Language,
                    )
                  }
                  className="w-full max-w-sm border border-[#a79093]/40 bg-[#f7f5f6] px-4 py-3 text-sm font-medium text-[#3e1919] outline-none transition focus:border-[#3e1919] focus:bg-white"
                >
                  <option value="en">English</option>
                  <option value="am">አማርኛ</option>
                  <option value="om">Afaan Oromoo</option>
                </select>
              </div>
            </div>

            {/* TITLE */}
            <div className="grid border-b border-[#a79093]/25 sm:grid-cols-[180px_1fr]">
              <div className="border-b border-[#a79093]/25 bg-[#f7f5f6] px-5 py-4 sm:border-b-0 sm:border-r">
                <label
                  htmlFor="title"
                  className="text-xs font-semibold uppercase tracking-[0.12em] text-[#a79093]"
                >
                  {currentLabels.title}
                </label>
              </div>

              <div className="px-5 py-4">
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder={currentLabels.titlePlaceholder}
                  required
                  className="w-full border-0 bg-transparent px-0 py-2 text-lg font-semibold text-[#3e1919] outline-none placeholder:text-[#a79093]/70 focus:ring-0"
                />
              </div>
            </div>

            {/* CONTENT */}
            <div className="grid sm:grid-cols-[180px_1fr]">
              <div className="border-b border-[#a79093]/25 bg-[#f7f5f6] px-5 py-4 sm:border-b-0 sm:border-r">
                <label
                  htmlFor="content"
                  className="text-xs font-semibold uppercase tracking-[0.12em] text-[#a79093]"
                >
                  {currentLabels.content}
                </label>
              </div>

              <div className="px-5 py-4">
                <textarea
                  id="content"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder={currentLabels.contentPlaceholder}
                  rows={12}
                  required
                  className="w-full resize-y border-0 bg-transparent px-0 py-2 text-sm leading-7 text-[#3e1919] outline-none placeholder:text-[#a79093]/70 focus:ring-0"
                />
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col-reverse gap-3 border-t border-[#a79093]/25 bg-[#f7f5f6] px-5 py-4 sm:flex-row sm:justify-end">
              {editingPostId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="border border-[#a79093]/40 bg-white px-6 py-2.5 text-sm font-semibold text-[#3e1919] transition hover:bg-[#f0e2d6]"
                >
                  {currentLabels.cancelButton}
                </button>
              )}

              <button
                type="submit"
                disabled={loading}
                className="bg-[#3e1919] px-7 py-2.5 text-sm font-semibold text-[#f0e2d6] transition hover:bg-[#3e1919]/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
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
        <section className="mt-16">
          <div className="flex flex-col gap-2 border-b border-[#a79093]/30 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a79093]">
                Published content
              </p>

              <h2 className="mt-1 text-2xl font-bold text-[#3e1919]">
                {currentLabels.postsTitle}
              </h2>
            </div>

            <p className="text-sm text-[#a79093]">
              {posts.length} {posts.length === 1 ? "post" : "posts"}
            </p>
          </div>

          <p className="mt-4 text-sm leading-6 text-[#a79093]">
            {currentLabels.postsDescription}
          </p>

          {postsLoading ? (
            <div className="border-y border-[#a79093]/25 py-14 text-center">
              <div className="mx-auto mb-4 h-6 w-6 animate-spin rounded-full border-2 border-[#a79093]/30 border-t-[#3e1919]" />

              <p className="text-sm text-[#a79093]">
                {currentLabels.loadingPosts}
              </p>
            </div>
          ) : posts.length === 0 ? (
            <div className="mt-8 border-y border-[#a79093]/25 py-14 text-center">
              <p className="text-sm font-medium text-[#3e1919]">
                {currentLabels.noPosts}
              </p>

              <p className="mt-2 text-xs text-[#a79093]">
                Create your first awareness publication using the
                editor above.
              </p>
            </div>
          ) : (
            <div className="mt-8 divide-y divide-[#a79093]/25 border-y border-[#a79093]/25">
              {posts.map((post, index) => (
                <article
                  key={post._id}
                  className="group bg-white px-5 py-7 transition hover:bg-[#f0e2d6]/30 sm:px-7"
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    {/* POST CONTENT */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#3e1919]">
                          {getLanguageName(post.language)}
                        </span>

                        <span className="h-1 w-1 rounded-full bg-[#a79093]" />

                        <span className="text-xs text-[#a79093]">
                          {new Date(
                            post.created_at,
                          ).toLocaleDateString()}
                        </span>

                        <span className="text-xs text-[#a79093]">
                          #{String(index + 1).padStart(2, "0")}
                        </span>
                      </div>

                      <h3 className="mt-4 text-xl font-bold leading-tight text-[#3e1919] sm:text-2xl">
                        {post.title}
                      </h3>

                      <p className="mt-4 max-w-4xl whitespace-pre-wrap text-sm leading-7 text-[#a79093]">
                        {post.content}
                      </p>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex shrink-0 items-center gap-2 lg:pt-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(post)}
                        className="border border-[#a79093]/40 bg-white px-4 py-2 text-sm font-semibold text-[#3e1919] transition hover:border-[#3e1919] hover:bg-[#f0e2d6]"
                      >
                        {currentLabels.editButton}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(post._id)}
                        disabled={deletingPostId === post._id}
                        className="border border-[#a79093]/30 px-4 py-2 text-sm font-semibold text-[#a79093] transition hover:border-[#3e1919] hover:bg-[#f0e2d6] hover:text-[#3e1919] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingPostId === post._id
                          ? "..."
                          : currentLabels.deleteButton}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* FOOTER NOTE */}
        <footer className="mt-12 border-t border-[#a79093]/25 pt-6">
          <p className="text-xs leading-5 text-[#a79093]">
            Awareness publications are managed by SafeLink
            administrators and made available to users according to
            their selected language.
          </p>
        </footer>
      </div>
    </main>
  );
}