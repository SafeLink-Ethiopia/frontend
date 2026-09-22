import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import QuickExit from "../components/QuickExit";
import { getSupportAwareness, AwarenessData } from "../services/awarenessApi";

export default function Support() {
  const [data, setData] = useState<AwarenessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAwareness() {
      try {
        const result = await getSupportAwareness();
        setData(result);
      } catch (err) {
        console.error(err);
        setError("Unable to load awareness information.");
      } finally {
        setLoading(false);
      }
    }

    loadAwareness();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <QuickExit />

        <div className="mx-auto max-w-4xl">
          <p className="text-gray-600">Loading awareness information...</p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <QuickExit />

        <div className="mx-auto max-w-4xl">
          <Link
            to="/awareness"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back to Awareness
          </Link>

          <div className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
            <p className="text-red-600">
              {error || "Unable to load awareness information."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <QuickExit />

      <div className="mx-auto max-w-4xl">
        <Link
          to="/awareness"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Awareness
        </Link>

        <section className="mt-6 mb-10">
          <p className="text-sm font-medium text-blue-600">
            SafeLink Awareness
          </p>

          <h1 className="mt-2 text-4xl font-bold text-gray-900">
            {data.title}
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-gray-600">
            {data.description}
          </p>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">
            You Can Ask for Help
          </h2>

          <p className="mt-4 leading-7 text-gray-600">
            Reaching out for support can be difficult, especially when you are
            unsure what to do next. You can start by talking to someone you
            trust or by finding a professional or community support service.
          </p>

          <p className="mt-4 leading-7 text-gray-600">
            You do not need to have everything figured out before asking for
            help. Simply explaining what is happening can be a first step.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900">Types of Support</h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">
                Trusted People
              </h3>

              <p className="mt-2 text-gray-600">
                Consider talking to a trusted friend, family member, teacher,
                mentor, colleague, or another person you feel safe with.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">
                Professional Support
              </h3>

              <p className="mt-2 text-gray-600">
                Depending on your situation, you may seek help from a healthcare
                professional, counselor, social worker, or another qualified
                support provider.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">
                Community Support
              </h3>

              <p className="mt-2 text-gray-600">
                Community organizations and support services may provide
                information, guidance, counseling, or other assistance.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">
                Emergency Help
              </h3>

              <p className="mt-2 text-gray-600">
                If you are in immediate danger, consider contacting local
                emergency services or moving to a safer place if you can do so
                safely.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl bg-blue-50 p-8">
          <h2 className="text-2xl font-bold text-gray-900">
            If You Are Not Ready to Talk
          </h2>

          <p className="mt-4 leading-7 text-gray-700">
            It is okay if you are not ready to tell someone everything. You can
            start by asking for general information, writing down what is
            happening, or identifying someone you could contact if you need
            support later.
          </p>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">
            Think About Your Safety
          </h2>

          <div className="mt-5 space-y-4 text-gray-600">
            <p>
              <strong className="text-gray-900">
                Choose a safe way to communicate:
              </strong>{" "}
              If someone may monitor your phone or accounts, consider whether it
              is safe to call, message, or browse for information.
            </p>

            <p>
              <strong className="text-gray-900">Choose a safe person:</strong>{" "}
              Reach out to someone you trust and who respects your privacy and
              choices.
            </p>

            <p>
              <strong className="text-gray-900">Make a plan:</strong> If you are
              concerned about your immediate safety, think about where you could
              go and who you could contact.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">Remember</h2>

          <p className="mt-4 leading-7 text-gray-600">
            Asking for support does not mean you have to make a decision
            immediately. You can learn about your options and decide what feels
            right and safe for your situation.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900">
            Research & Further Reading
          </h2>

          <p className="mt-2 text-gray-600">
            Explore research related to survivor support, help-seeking, and
            support services.
          </p>

          <div className="mt-6 space-y-5">
            {data.sources.length === 0 ? (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-gray-600">
                  No research sources are currently available.
                </p>
              </div>
            ) : (
              data.sources.map((source, index) => (
                <article
                  key={`${source.title}-${index}`}
                  className="rounded-2xl bg-white p-6 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-gray-900">
                    {source.title}
                  </h3>

                  <p className="mt-3 leading-7 text-gray-600">
                    {source.summary}
                  </p>

                  {source.authors?.length > 0 && (
                    <p className="mt-4 text-sm text-gray-500">
                      <span className="font-medium text-gray-700">
                        Authors:
                      </span>{" "}
                      {source.authors.join(", ")}
                    </p>
                  )}

                  {source.published && (
                    <p className="mt-1 text-sm text-gray-500">
                      <span className="font-medium text-gray-700">
                        Published:
                      </span>{" "}
                      {new Date(source.published).toLocaleDateString()}
                    </p>
                  )}

                  <div className="mt-4 flex gap-4">
                    {source.absLink && (
                      <a
                        href={source.absLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:text-blue-700"
                      >
                        View Paper →
                      </a>
                    )}

                    {source.pdfLink && (
                      <a
                        href={source.pdfLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:text-blue-700"
                      >
                        PDF →
                      </a>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
