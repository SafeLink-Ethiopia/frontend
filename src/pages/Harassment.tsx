import { Link } from "react-router-dom";
import QuickExit from "../components/QuickExit";

export default function Harassment() {
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
            Understanding Harassment
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-gray-600">
            Learn how to recognize unwanted or inappropriate behavior,
            understand your boundaries, and know when to seek support.
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
      </div>
    </main>
  );
}
