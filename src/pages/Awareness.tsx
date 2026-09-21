import { Link } from "react-router-dom";
import QuickExit from "../components/QuickExit";
export default function Awareness() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <QuickExit />
      <div className="mx-auto max-w-5xl">
        <section className="mb-10">
          <p className="text-sm font-medium text-blue-600">
            SafeLink Awareness
          </p>

          <h1 className="mt-2 text-4xl font-bold text-gray-900">
            Know Your Rights & Boundaries
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-gray-600">
            Learn about consent, personal boundaries, harassment, and other
            topics that can help you make informed decisions about your safety
            and wellbeing.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <Link
            to="/awareness/consent"
            className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="mb-4 text-3xl">🤝</div>

            <h2 className="text-xl font-semibold text-gray-900">
              What is Consent?
            </h2>

            <p className="mt-2 text-gray-600">
              Learn about freely given consent, personal boundaries, and the
              right to change your mind.
            </p>

            <span className="mt-5 inline-block font-medium text-blue-600">
              Learn more →
            </span>
          </Link>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 text-3xl">🛡️</div>

            <h2 className="text-xl font-semibold text-gray-900">
              Personal Boundaries
            </h2>

            <p className="mt-2 text-gray-600">
              Learn about setting, communicating, and respecting personal
              boundaries.
            </p>

            <span className="mt-5 inline-block text-sm text-gray-400">
              Coming soon
            </span>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 text-3xl">⚠️</div>

            <h2 className="text-xl font-semibold text-gray-900">
              Understanding Harassment
            </h2>

            <p className="mt-2 text-gray-600">
              Learn how to recognize inappropriate or unwanted behavior and
              understand available support options.
            </p>

            <span className="mt-5 inline-block text-sm text-gray-400">
              Coming soon
            </span>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 text-3xl">💬</div>

            <h2 className="text-xl font-semibold text-gray-900">
              Getting Support
            </h2>

            <p className="mt-2 text-gray-600">
              Learn about seeking support and finding trusted resources when you
              need help.
            </p>

            <span className="mt-5 inline-block text-sm text-gray-400">
              Coming soon
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
