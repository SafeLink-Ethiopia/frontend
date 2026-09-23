import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import QuickExit from "../components/QuickExit";
import {
  getHarassmentAwareness,
  AwarenessData,
} from "../services/awarenessApi";

export default function Harassment() {
  const [data, setData] = useState<AwarenessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAwareness() {
      try {
        const result = await getHarassmentAwareness();
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
            What Is Harassment?
          </h2>

          <p className="mt-4 leading-7 text-gray-600">
            Harassment is unwanted behavior that can make someone feel
            uncomfortable, threatened, humiliated, or unsafe. It can happen in
            person, online, at school, at work, or in other settings.
          </p>

          <p className="mt-4 leading-7 text-gray-600">
            Harassment can take different forms, and repeated behavior is not
            always required for conduct to be harmful or inappropriate.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Examples of Harassment
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">
                Verbal Harassment
              </h3>

              <p className="mt-2 text-gray-600">
                This can include unwanted insults, threats, offensive comments,
                or repeated remarks about someone's body or personal life.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">
                Sexual Harassment
              </h3>

              <p className="mt-2 text-gray-600">
                This can include unwanted sexual comments, requests, jokes,
                messages, gestures, or other unwanted sexual behavior.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">
                Online Harassment
              </h3>

              <p className="mt-2 text-gray-600">
                This can include unwanted messages, threats, repeated unwanted
                contact, sharing private information, or abusive behavior
                online.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">
                Physical Harassment
              </h3>

              <p className="mt-2 text-gray-600">
                This can include unwanted physical contact, blocking someone's
                movement, or other physical behavior that makes a person feel
                unsafe.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">
            Recognizing Warning Signs
          </h2>

          <div className="mt-5 space-y-4 text-gray-600">
            <p>
              <strong className="text-gray-900">
                Your boundaries are being ignored:
              </strong>{" "}
              You have clearly communicated that something is unwanted, but the
              behavior continues.
            </p>

            <p>
              <strong className="text-gray-900">
                You feel pressured or intimidated:
              </strong>{" "}
              Someone uses pressure, threats, or fear to make you do something
              you do not want to do.
            </p>

            <p>
              <strong className="text-gray-900">
                Someone repeatedly contacts you:
              </strong>{" "}
              A person continues contacting you after you have asked them to
              stop.
            </p>

            <p>
              <strong className="text-gray-900">You feel unsafe:</strong> If
              someone's behavior makes you feel threatened or unsafe, it is
              important to take those feelings seriously.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl bg-blue-50 p-8">
          <h2 className="text-2xl font-bold text-gray-900">What Can You Do?</h2>

          <div className="mt-5 space-y-4 text-gray-700">
            <p>
              <strong className="text-gray-900">Set a boundary:</strong> When it
              is safe to do so, clearly communicate that the behavior is
              unwanted.
            </p>

            <p>
              <strong className="text-gray-900">Create distance:</strong> Move
              away from the situation or limit contact when possible.
            </p>

            <p>
              <strong className="text-gray-900">Save evidence:</strong> For
              online harassment, consider keeping screenshots, messages, or
              other relevant information.
            </p>

            <p>
              <strong className="text-gray-900">
                Talk to someone you trust:
              </strong>{" "}
              You do not have to deal with harassment alone. Consider reaching
              out to a trusted person or an appropriate support service.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">Remember</h2>

          <p className="mt-4 leading-7 text-gray-600">
            You have the right to feel safe and to have your boundaries
            respected. If someone harasses you, the responsibility for their
            behavior belongs to them. Seeking support is a valid option, and you
            can choose the approach that feels safest for your situation.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900">
            Research & Further Reading
          </h2>

          <p className="mt-2 text-gray-600">
            Explore research related to harassment, sexual harassment, and
            survivor support.
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
