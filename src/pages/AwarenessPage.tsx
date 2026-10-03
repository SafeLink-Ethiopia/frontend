
import { useEffect, useState } from "react";
import {
  getAwarenessPosts,
  type AwarenessPost,
  type Language,
} from "../api/awarenessApi";

export default function AwarenessPage() {
  const [posts, setPosts] = useState<AwarenessPost[]>([]);
  const [language, setLanguage] = useState<Language>("en");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAwarenessPosts();
        setPosts(data);
      } catch (err) {
        console.error("Failed to load awareness posts:", err);
        setError("Failed to load awareness posts.");
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  const filteredPosts = posts.filter(
    (post) => post.language === language,
  );

  return (
    <main className="min-h-screen bg-[#faf8f3] px-6 py-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-[#33484D]">
            Awareness
          </h1>

          <p className="mt-2 text-sm text-[#6B7A7C]">
            Information and resources to help you stay informed and safe.
          </p>
        </div>

        {/* Language selector */}
        <div className="mb-8 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={`rounded-xl px-5 py-2 text-sm font-medium transition ${
              language === "en"
                ? "bg-[#5C838A] text-white"
                : "bg-white text-[#5C838A] shadow-sm"
            }`}
          >
            English
          </button>

          <button
            type="button"
            onClick={() => setLanguage("am")}
            className={`rounded-xl px-5 py-2 text-sm font-medium transition ${
              language === "am"
                ? "bg-[#5C838A] text-white"
                : "bg-white text-[#5C838A] shadow-sm"
            }`}
          >
            አማርኛ
          </button>

          <button
            type="button"
            onClick={() => setLanguage("om")}
            className={`rounded-xl px-5 py-2 text-sm font-medium transition ${
              language === "om"
                ? "bg-[#5C838A] text-white"
                : "bg-white text-[#5C838A] shadow-sm"
            }`}
          >
            Afaan Oromoo
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-12 text-center text-sm text-[#6B7A7C]">
            Loading awareness posts...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl bg-red-50 p-5 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        {/* No posts */}
        {!loading && !error && filteredPosts.length === 0 && (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-[#6B7A7C]">
              No awareness posts are available in this language yet.
            </p>
          </div>
        )}

        {/* Posts */}
        {!loading && !error && filteredPosts.length > 0 && (
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <article
                key={post._id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <h2 className="text-xl font-semibold text-[#33484D]">
                  {post.title}
                </h2>

                <p className="mt-1 text-xs text-[#8A989A]">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>

                <div className="mt-4 whitespace-pre-line text-sm leading-7 text-[#526164]">
                  {post.content}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

