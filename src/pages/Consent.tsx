import { useEffect, useState } from "react";
import { getConsentAwareness, AwarenessData } from "../services/awarenessApi";
import QuickExit from "../components/QuickExit";
export default function Consent() {
  const [data, setData] = useState<AwarenessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAwareness() {
      try {
        const result = await getConsentAwareness();
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error || "Something went wrong."}</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <QuickExit />

      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <section className="mb-10">
          <p className="mb-2 text-sm font-medium text-blue-600">
            SafeLink Awareness
          </p>

          <h1 className="text-4xl font-bold text-gray-900">{data.title}</h1>

          <p className="mt-4 max-w-2xl text-lg text-gray-600">
            {data.description}
          </p>
        </section>

        {/* Educational content */}
        <section className="rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900">
            Understanding Consent
          </h2>

          <p className="mt-4 leading-7 text-gray-600">
            Consent means freely agreeing to something. It should be voluntary,
            informed, and respected. Everyone has the right to decide what they
            are comfortable with and to communicate their boundaries.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-blue-50 p-5">
              <h3 className="font-semibold text-gray-900">Freely Given</h3>
              <p className="mt-2 text-sm text-gray-600">
                Consent should be given without pressure, threats, or
                manipulation.
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-5">
              <h3 className="font-semibold text-gray-900">Informed</h3>
              <p className="mt-2 text-sm text-gray-600">
                People should understand what they are agreeing to.
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-5">
              <h3 className="font-semibold text-gray-900">Can Change</h3>
              <p className="mt-2 text-sm text-gray-600">
                Someone can change their mind and withdraw consent.
              </p>
            </div>
          </div>
        </section>

        {/* Research */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">
            Research & Further Reading
          </h2>

          <p className="mt-2 text-gray-600">
            Explore research related to consent, sexual safety, and personal
            boundaries.
          </p>

          <div className="mt-6 space-y-5">
            {data.sources.map((source, index) => (
              <article
                key={`${source.title}-${index}`}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {source.title}
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  {source.authors?.join(", ")}
                </p>

                <p className="mt-4 leading-6 text-gray-600">{source.summary}</p>

                <div className="mt-5 flex gap-4">
                  <a
                    href={source.absLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline"
                  >
                    Read research
                  </a>

                  <a
                    href={source.pdfLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-gray-600 hover:underline"
                  >
                    PDF
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
