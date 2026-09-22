import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import QuickExit from "../components/QuickExit";
import {
  getBoundariesAwareness,
  AwarenessData,
} from "../services/awarenessApi";

export default function Boundaries() {
  const [data, setData] = useState<AwarenessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAwareness() {
      try {
        const result = await getBoundariesAwareness();
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
            What Are Personal Boundaries?
          </h2>

          <p className="mt-4 leading-7 text-gray-600">
            Boundaries help us communicate what we are comfortable with and what
            we are not comfortable with. Everyone has the right to set
            boundaries, and everyone should respect the boundaries of others.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Different Types of Boundaries
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">
                Physical Boundaries
              </h3>

              <p className="mt-2 text-gray-600">
                These include personal space and physical contact. You have the
                right to decide who can touch you and what kind of contact you
                are comfortable with.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">
                Emotional Boundaries
              </h3>

              <p className="mt-2 text-gray-600">
                These involve your feelings and emotional privacy. You can
                decide what personal information you want to share and when you
                want to talk about difficult experiences.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">
                Digital Boundaries
              </h3>

              <p className="mt-2 text-gray-600">
                These include your online privacy, messages, photos, accounts,
                and social media. You can decide what you share and who can
                access your information.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">
                Time & Personal Space
              </h3>

              <p className="mt-2 text-gray-600">
                You have the right to decide how you spend your time and when
                you need space for yourself.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">
            How Can You Communicate a Boundary?
          </h2>

          <div className="mt-5 space-y-4 text-gray-600">
            <p>
              <strong className="text-gray-900">Be clear:</strong> Say what you
              are comfortable with and what you are not.
            </p>

            <p>
              <strong className="text-gray-900">Be direct:</strong> You do not
              need to give a long explanation for saying no.
            </p>

            <p>
              <strong className="text-gray-900">Speak up when needed:</strong>{" "}
              If something makes you uncomfortable, it is okay to communicate
              that feeling.
            </p>

            <p>
              <strong className="text-gray-900">Remember:</strong> You can
              change your boundaries as your situation or feelings change.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl bg-blue-50 p-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Respecting Other People's Boundaries
          </h2>

          <p className="mt-4 leading-7 text-gray-700">
            Boundaries work both ways. Just as you have the right to set your
            own boundaries, other people have the right to set theirs. A
            person's boundaries should be respected, even when you do not
            completely understand or agree with them.
          </p>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">
            If Someone Ignores Your Boundaries
          </h2>

          <p className="mt-4 leading-7 text-gray-600">
            If someone repeatedly ignores your boundaries or makes you feel
            unsafe, consider creating distance from the situation and reaching
            out to someone you trust. You do not have to handle an unsafe
            situation alone.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900">
            Research & Further Reading
          </h2>

          <p className="mt-2 text-gray-600">
            Explore research related to personal boundaries and privacy.
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
