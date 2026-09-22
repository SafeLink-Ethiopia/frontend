import { Link } from "react-router-dom";
import QuickExit from "../components/QuickExit";

export default function Boundaries() {
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
            Personal Boundaries
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-gray-600">
            Personal boundaries are the limits we set around our body, time,
            emotions, privacy, and relationships. Understanding boundaries can
            help people communicate their needs and respect the needs of others.
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
      </div>
    </main>
  );
}
