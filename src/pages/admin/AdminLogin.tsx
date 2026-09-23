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
  creatingButton: string;
  backButton: string;
  pageTitle: string;
  pageDescription: string;
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
    creatingButton: "Creating Post...",
    backButton: "Back to Dashboard",
    pageTitle: "Create Awareness Post",
    pageDescription: "Create an awareness post in your selected language.",
  },

  am: {
    language: "ቋንቋ",
    title: "ርዕስ",
    content: "ይዘት",
    titlePlaceholder: "ርዕስ ያስገቡ",
    contentPlaceholder: "የግንዛቤ ይዘት ያስገቡ",
    createButton: "የግንዛቤ ልጥፍ ይፍጠሩ",
    creatingButton: "በመፍጠር ላይ...",
    backButton: "ወደ ዳሽቦርድ ተመለስ",
    pageTitle: "የግንዛቤ ልጥፍ ይፍጠሩ",
    pageDescription: "በመረጡት ቋንቋ የግንዛቤ ልጥፍ ይፍጠሩ።",
  },

  om: {
    language: "Afaan",
    title: "Mata-duree",
    content: "Qabiyyee",
    titlePlaceholder: "Mata-duree galchi",
    contentPlaceholder: "Qabiyyee hubannoo galchi",
    createButton: "Barreeffama Hubannoo Uumi",
    creatingButton: "Uumaa jira...",
    backButton: "Gara Dashboard Deebi'i",
    pageTitle: "Barreeffama Hubannoo Uumi",
    pageDescription: "Afaan filatte keessatti barreeffama hubannoo uumi.",
  },
};

export default function AdminAwareness() {
  const navigate = useNavigate();

  const [language, setLanguage] = useState<Language>("en");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [posts, setPosts] = useState<AwarenessPost[]>([]);

  const [loading, setLoading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(true);

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
      const response = await fetch(
        "http://localhost:5000/api/admin/awareness-posts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            language,
            title,
            content,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create awareness post.");
      }

      setSuccess("Awareness post created successfully.");

      setTitle("");
      setContent("");

      await fetchPosts();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create awareness post.",
      );
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gray-100 px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {currentLabels.pageTitle}
            </h1>

            <p className="mt-2 text-gray-600">
              {currentLabels.pageDescription}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            className="rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-300"
          >
            {currentLabels.backButton}
          </button>
        </div>

        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-12 space-y-6">
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <label
              htmlFor="language"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              {currentLabels.language}
            </label>

            <select
              id="language"
              value={language}
              onChange={(event) =>
                handleLanguageChange(event.target.value as Language)
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="en">English</option>

              <option value="am">አማርኛ</option>

              <option value="om">Afaan Oromoo</option>
            </select>
          </section>

          <section className="rounded-xl bg-white p-6 shadow-sm">
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  {currentLabels.title}
                </label>

                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder={currentLabels.titlePlaceholder}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="content"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  {currentLabels.content}
                </label>

                <textarea
                  id="content"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder={currentLabels.contentPlaceholder}
                  rows={12}
                  required
                  className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? currentLabels.creatingButton
                : currentLabels.createButton}
            </button>
          </div>
        </form>

        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Awareness Posts
            </h2>

            <p className="mt-1 text-gray-600">
              Posts created by the administrator.
            </p>
          </div>

          {postsLoading ? (
            <div className="rounded-xl bg-white p-8 text-center text-gray-500 shadow-sm">
              Loading posts...
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-xl bg-white p-8 text-center text-gray-500 shadow-sm">
              No awareness posts have been created yet.
            </div>
          ) : (
            <div className="space-y-5">
              {posts.map((post) => (
                <article
                  key={post._id}
                  className="rounded-xl bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                        {getLanguageName(post.language)}
                      </span>

                      <h3 className="mt-3 text-xl font-bold text-gray-900">
                        {post.title}
                      </h3>
                    </div>

                    <span className="whitespace-nowrap text-sm text-gray-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="whitespace-pre-wrap text-gray-700">
                    {post.content}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
