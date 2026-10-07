import { useEffect, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  Globe2,
  ShieldCheck,
} from "lucide-react";
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
    <main className="min-h-screen bg-[#f7f5f6]">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-[#3e1919]">
        {/* Decorative shapes */}
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#f0e2d6]/10" />
        <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-[#a79093]/10" />

        <div className="relative mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            {/* Icon */}
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f0e2d6] shadow-lg">
              <ShieldCheck
                size={31}
                strokeWidth={1.8}
                className="text-[#3e1919]"
              />
            </div>

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#f0e2d6]/20 bg-[#f0e2d6]/10 px-3 py-1.5 text-xs font-medium text-[#f0e2d6]">
              <BookOpen size={13} />
              SafeLink Knowledge Center
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-[#f7f5f6] sm:text-4xl lg:text-5xl">
              Awareness & Resources
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#a79093] sm:text-base">
              Trusted information and practical resources to help you
              stay informed, understand important topics, and make
              safer decisions.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        {/* Language Section */}
        <section className="mb-8 rounded-3xl border border-[#f0e2d6] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0e2d6]">
                <Globe2
                  size={19}
                  className="text-[#3e1919]"
                />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-[#3e1919]">
                  Choose your language
                </h2>

                <p className="mt-0.5 text-xs text-[#a79093]">
                  Read resources in your preferred language.
                </p>
              </div>
            </div>

            {/* Language Selector */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  language === "en"
                    ? "bg-[#3e1919] text-[#f7f5f6] shadow-sm"
                    : "bg-[#f0e2d6] text-[#3e1919] hover:bg-[#a79093] hover:text-[#f7f5f6]"
                }`}
              >
                English
              </button>

              <button
                type="button"
                onClick={() => setLanguage("am")}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  language === "am"
                    ? "bg-[#3e1919] text-[#f7f5f6] shadow-sm"
                    : "bg-[#f0e2d6] text-[#3e1919] hover:bg-[#a79093] hover:text-[#f7f5f6]"
                }`}
              >
                አማርኛ
              </button>

              <button
                type="button"
                onClick={() => setLanguage("om")}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  language === "om"
                    ? "bg-[#3e1919] text-[#f7f5f6] shadow-sm"
                    : "bg-[#f0e2d6] text-[#3e1919] hover:bg-[#a79093] hover:text-[#f7f5f6]"
                }`}
              >
                Afaan Oromoo
              </button>
            </div>
          </div>
        </section>

        {/* Section Heading */}
        {!loading && !error && filteredPosts.length > 0 && (
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#a79093]">
                Knowledge & Support
              </p>

              <h2 className="text-2xl font-bold text-[#3e1919]">
                Latest resources
              </h2>
            </div>

            <div className="hidden items-center gap-2 rounded-full bg-[#f0e2d6] px-3 py-1.5 text-xs font-medium text-[#3e1919] sm:flex">
              <BookOpen size={13} />
              {filteredPosts.length}{" "}
              {filteredPosts.length === 1
                ? "resource"
                : "resources"}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-[#f0e2d6] bg-white">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0e2d6]">
                <BookOpen
                  size={22}
                  className="animate-pulse text-[#3e1919]"
                />
              </div>

              <div className="text-center">
                <p className="text-sm font-semibold text-[#3e1919]">
                  Loading resources
                </p>

                <p className="mt-1 text-xs text-[#a79093]">
                  Please wait while we fetch the latest information.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-3xl border border-[#a79093]/30 bg-[#f0e2d6] p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#3e1919]">
              <ShieldCheck
                size={22}
                className="text-[#f0e2d6]"
              />
            </div>

            <h3 className="font-semibold text-[#3e1919]">
              Unable to load resources
            </h3>

            <p className="mt-2 text-sm text-[#a79093]">
              {error}
            </p>
          </div>
        )}

        {/* No Posts */}
        {!loading && !error && filteredPosts.length === 0 && (
          <div className="rounded-3xl border border-[#f0e2d6] bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0e2d6]">
              <BookOpen
                size={25}
                className="text-[#3e1919]"
              />
            </div>

            <h3 className="text-lg font-semibold text-[#3e1919]">
              No resources available
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#a79093]">
              No awareness posts are available in this language
              yet. Please try another language or check back later.
            </p>
          </div>
        )}

        {/* Posts */}
        {!loading && !error && filteredPosts.length > 0 && (
          <div className="grid gap-5 lg:grid-cols-2">
            {filteredPosts.map((post, index) => (
              <article
                key={post._id}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#f0e2d6] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Card Top */}
                <div className="h-1.5 bg-[#3e1919]" />

                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  {/* Category / Number */}
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0e2d6]">
                      <BookOpen
                        size={18}
                        className="text-[#3e1919]"
                      />
                    </div>

                    <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-[#3e1919] px-2.5 text-xs font-bold text-[#f7f5f6]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold leading-7 text-[#3e1919] transition group-hover:text-[#a79093]">
                    {post.title}
                  </h2>

                  {/* Date */}
                  <div className="mt-3 flex items-center gap-2 text-xs text-[#a79093]">
                    <CalendarDays size={14} />

                    <span>
                      {new Date(
                        post.created_at,
                      ).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="my-5 h-px bg-[#f0e2d6]" />

                  {/* Content */}
                  <div className="flex-1 whitespace-pre-line text-sm leading-7 text-[#a79093]">
                    {post.content}
                  </div>

                  {/* Footer */}
                  <div className="mt-6 flex items-center justify-between border-t border-[#f0e2d6] pt-4">
                    <span className="text-xs font-medium text-[#a79093]">
                      SafeLink resource
                    </span>

                    <div className="flex items-center gap-1 text-xs font-semibold text-[#3e1919] transition group-hover:text-[#a79093]">
                      Read resource
                      <ChevronRight
                        size={14}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Bottom Trust Section */}
        {!loading && !error && filteredPosts.length > 0 && (
          <div className="mt-8 rounded-3xl bg-[#3e1919] px-6 py-7 sm:px-8">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f0e2d6]">
                <ShieldCheck
                  size={24}
                  className="text-[#3e1919]"
                />
              </div>

              <div>
                <h3 className="font-semibold text-[#f7f5f6]">
                  Stay informed. Stay safe.
                </h3>

                <p className="mt-1 text-sm leading-6 text-[#a79093]">
                  Explore the available resources and use trusted
                  information to support safer decisions.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}