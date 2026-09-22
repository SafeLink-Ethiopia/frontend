import { Link } from "react-router-dom";
import QuickExit from "../components/QuickExit";

export default function Support() {
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
            Getting Support
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-gray-600">
            You do not have to deal with a difficult or unsafe situation alone.
            Learn about different ways to seek support and choose the option
            that feels safest for you.
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
      </div>
    </main>
  );
}
