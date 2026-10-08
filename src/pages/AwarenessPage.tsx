import { useEffect, useState } from "react";
import {
  ArrowLeft,
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

  // New: which article is open (null = list view)
  const [selectedPost, setSelectedPost] =
    useState<AwarenessPost | null>(null);
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

  /* -----------------------------------------------------------
     Preview helper: show the first ~150 characters so the card
     reads like a Medium/Substack teaser, not the whole article.
  ----------------------------------------------------------- */
  const getPreview = (content: string, limit = 150) => {
    const clean = content.replace(/\s+/g, " ").trim();
    if (clean.length <= limit) return clean;
    return clean.slice(0, limit).trimEnd() + "…";
  };

  /* -----------------------------------------------------------
     ARTICLE VIEW — opens when selectedPost is set
  ----------------------------------------------------------- */
  if (selectedPost) {
    return (
      <main className="min-h-screen bg-[#FAFBF7] text-[#173B28]">
        {/* =========================================================
            NAVBAR — floating glass card, matches LandingPage
        ========================================================= */}
        <header className="fixed left-0 right-0 top-0 z-50">
          <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
            <nav className="flex items-center justify-between rounded-2xl border border-[#2F8F4E]/30 bg-white/85 px-4 py-3 shadow-lg backdrop-blur-md">
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="group flex items-center gap-3"
                aria-label="Back to resources"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2F8F4E] transition group-hover:bg-[#176B3A]">
                  <ArrowLeft
                    size={18}
                    className="text-white"
                  />
                </div>

                <div className="text-left">
                  <p className="text-sm font-bold text-[#176B3A] transition group-hover:text-[#2F8F4E]">
                    Back to resources
                  </p>

                  <p className="mt-0.5 text-[9px] font-semibold tracking-[0.25em] text-[#2F8F4E]">
                    AWARENESS
                  </p>
                </div>
              </button>

              <span className="hidden rounded-full border border-[#2F8F4E]/30 bg-[#E7F1E3] px-3.5 py-1.5 text-xs font-semibold text-[#2F8F4E] sm:inline-flex">
                {language === "en"
                  ? "English"
                  : language === "am"
                  ? "አማርኛ"
                  : "Afaan Oromoo"}
              </span>
            </nav>
          </div>
        </header>

        {/* =========================================================
            ARTICLE
        ========================================================= */}
        <article className="mx-auto max-w-3xl px-5 pt-32 pb-20 sm:px-8 sm:pt-40">
          {/* Eyebrow */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full bg-[#E7F1E3] px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#2F8F4E]">
              SafeLink Resource
            </span>

            <span className="inline-flex items-center gap-1.5 text-xs text-[#173B28]/60">
              <CalendarDays size={13} />
              {new Date(
                selectedPost.created_at,
              ).toLocaleDateString()}
            </span>
          </div>

          {/* Title */}
          <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-[#176B3A] sm:text-5xl">
            {selectedPost.title}
          </h1>

          {/* Divider */}
          <div className="mt-8 h-1 w-20 rounded-full bg-[#2F8F4E]" />

          {/* Content */}
          <div className="mt-10 whitespace-pre-line text-base leading-8 text-[#173B28]/85 sm:text-lg sm:leading-9">
            {selectedPost.content}
          </div>

          {/* Footer nav */}
          <div className="mt-16 border-t border-[#E7F1E3] pt-8">
            <button
              type="button"
              onClick={() => setSelectedPost(null)}
              className="group inline-flex items-center gap-3 rounded-full bg-[#2F8F4E] px-6 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#176B3A]"
            >
              <ArrowLeft
                size={16}
                className="transition-transform duration-200 group-hover:-translate-x-1"
              />
              Back to all resources
            </button>
          </div>
        </article>
      </main>
    );
  }

  /* -----------------------------------------------------------
     LIST VIEW — default
  ----------------------------------------------------------- */
  return (
    <main className="min-h-screen bg-[#FAFBF7] text-[#173B28]">
      {/* =========================================================
          NAVBAR — floating glass card, matches LandingPage
      ========================================================= */}
      <header className="fixed left-0 right-0 top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between rounded-2xl border border-[#2F8F4E]/30 bg-white/85 px-4 py-3 shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-3">
              <LogoMark className="h-10 w-10" />

              <div className="text-left">
                <p className="text-xl font-extrabold leading-none tracking-tight text-[#2F8F4E]">
                  SafeLink
                </p>

                <p className="mt-1 text-[9px] font-semibold tracking-[0.25em] text-[#2F8F4E]">
                  ETHIOPIA
                </p>
              </div>
            </div>

            <span className="hidden rounded-full border border-[#2F8F4E]/30 bg-[#E7F1E3] px-3.5 py-1.5 text-xs font-semibold text-[#2F8F4E] sm:inline-flex">
              Awareness Center
            </span>
          </nav>
        </div>
      </header>

      {/* =========================================================
          HERO — same mint gradient as LandingPage/InfoPage
      ========================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FAFBF7] via-[#E7F1E3] to-[#E7F1E3] pt-32 pb-16 sm:pt-40 sm:pb-20">
        <div className="pointer-events-none absolute -right-24 top-20 h-96 w-96 rounded-full bg-[#2F8F4E]/15 blur-3xl" />

        <div className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-[#2F8F4E]/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-5 text-center sm:px-8">
          

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#2F8F4E]/30 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-[#2F8F4E] backdrop-blur-md">
            
            SafeLink Knowledge Center
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#176B3A] sm:text-4xl lg:text-5xl">
            Awareness & Resources
          </h1>

          <div className="mx-auto mt-6 h-1 w-20 rounded-full bg-[#2F8F4E]" />

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#173B28]/75 sm:text-base sm:leading-8">
            Trusted information and practical resources to help you
            stay informed, understand important topics, and make
            safer decisions.
          </p>
        </div>
      </section>

      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
        {/* Language Section — soft rounded card */}
        <section className="mb-10 rounded-2xl border border-[#2F8F4E]/30 bg-white p-5 shadow-lg sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E7F1E3]">
                <Globe2
                  size={19}
                  className="text-[#2F8F4E]"
                />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-[#176B3A]">
                  Choose your language
                </h2>

                <p className="mt-0.5 text-xs text-[#173B28]/60">
                  Read resources in your preferred language.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  language === "en"
                    ? "bg-[#2F8F4E] text-white shadow-md"
                    : "border border-[#2F8F4E]/40 bg-white text-[#2F8F4E] hover:-translate-y-0.5 hover:border-[#2F8F4E] hover:bg-[#FAFBF7]"
                }`}
              >
                English
              </button>

              <button
                type="button"
                onClick={() => setLanguage("am")}
                className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  language === "am"
                    ? "bg-[#2F8F4E] text-white shadow-md"
                    : "border border-[#2F8F4E]/40 bg-white text-[#2F8F4E] hover:-translate-y-0.5 hover:border-[#2F8F4E] hover:bg-[#FAFBF7]"
                }`}
              >
                አማርኛ
              </button>

              <button
                type="button"
                onClick={() => setLanguage("om")}
                className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  language === "om"
                    ? "bg-[#2F8F4E] text-white shadow-md"
                    : "border border-[#2F8F4E]/40 bg-white text-[#2F8F4E] hover:-translate-y-0.5 hover:border-[#2F8F4E] hover:bg-[#FAFBF7]"
                }`}
              >
                Afaan Oromoo
              </button>
            </div>
          </div>
        </section>

        {/* Section Heading */}
        {!loading && !error && filteredPosts.length > 0 && (
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#2F8F4E]">
                Knowledge & Support
              </p>

              <h2 className="text-2xl font-semibold text-[#176B3A] sm:text-3xl">
                Latest resources
              </h2>
            </div>

            <div className="hidden items-center gap-2 rounded-full bg-[#E7F1E3] px-3.5 py-1.5 text-xs font-medium text-[#2F8F4E] sm:flex">
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
                  Loading resources
                </p>

                <p className="mt-1 text-xs text-[#173B28]/60">
                  Please wait while we fetch the latest information.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-[#2F8F4E]/30 bg-[#E7F1E3] p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#2F8F4E]">
              <ShieldCheck
                size={22}
                className="text-white"
              />
            </div>

            <h3 className="font-semibold text-[#176B3A]">
              Unable to load resources
            </h3>

            <p className="mt-2 text-sm text-[#173B28]/70">
              {error}
            </p>
          </div>
        )}

        {/* No Posts */}
        {!loading && !error && filteredPosts.length === 0 && (
          <div className="rounded-2xl border border-[#2F8F4E]/30 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E7F1E3]">
              <BookOpen
                size={25}
                className="text-[#2F8F4E]"
              />
            </div>

            <h3 className="text-lg font-semibold text-[#176B3A]">
              No resources available
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#173B28]/65">
              No awareness posts are available in this language
              yet. Please try another language or check back later.
            </p>
          </div>
        )}

        {/* =========================================================
            POSTS — Medium-style cards
        ========================================================= */}
        {!loading && !error && filteredPosts.length > 0 && (
          <div className="grid gap-5 lg:grid-cols-2">
            {filteredPosts.map((post, index) => (
              <article
                key={post._id}
                onClick={() => setSelectedPost(post)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {
                    event.preventDefault();
                    setSelectedPost(post);
                  }
                }}
                role="button"
                tabIndex={0}
                className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#E7F1E3] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#2F8F4E] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#2F8F4E] focus:ring-offset-2"
              >
                {/* Accent bar */}
                <div className="h-1.5 bg-[#2F8F4E]" />

                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  {/* Top row */}
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E7F1E3] transition group-hover:bg-[#2F8F4E]">
                      <BookOpen
                        size={18}
                        className="text-[#2F8F4E] transition group-hover:text-white"
                      />
                    </div>

                    <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-[#2F8F4E] px-2.5 text-xs font-bold text-white">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold leading-7 text-[#176B3A] transition group-hover:text-[#2F8F4E]">
                    {post.title}
                  </h2>

                  {/* Date */}
                  <div className="mt-3 flex items-center gap-2 text-xs text-[#173B28]/60">
                    <CalendarDays size={14} />
                    <span>
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="my-5 h-px bg-[#E7F1E3]" />

                  {/* Preview — Medium style */}
                  <p className="flex-1 text-sm leading-7 text-[#173B28]/70">
                    {getPreview(post.content)}
                  </p>

                  {/* Read more */}
                  <div className="mt-6 flex items-center justify-between border-t border-[#E7F1E3] pt-4">
                    <span className="text-xs font-medium text-[#173B28]/55">
                      SafeLink resource
                    </span>

                    <span className="flex items-center gap-1 text-xs font-semibold text-[#2F8F4E] transition group-hover:text-[#176B3A]">
                      Read more
                      <ChevronRight
                        size={14}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* =========================================================
            BOTTOM TRUST SECTION — deep forest band
        ========================================================= */}
        {!loading && !error && filteredPosts.length > 0 && (
          <div className="mt-12 rounded-[2rem] bg-[#176B3A] px-6 py-8 sm:px-10">
            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E7F1E3]">
                <LogoMark className="h-10 w-10" />
              </div>

              <div>
                <h3 className="font-semibold text-white">
                  Stay informed. Stay safe.
                </h3>

                <p className="mt-1 text-sm leading-6 text-[#E7F1E3]">
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