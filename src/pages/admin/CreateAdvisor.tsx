import { FormEvent, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

type AdvisorType = "medical" | "legal" | "psychological" | "general";
type AdvisorGender = "male" | "female";

export default function CreateAdvisor() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "" as AdvisorGender | "",
    type: "" as AdvisorType | "",
    phone_number: "",
    location: "",
    start: "09:00",
    end: "17:00",
    active: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Advisor name is required.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Advisor email is required.");
      return;
    }

    if (!formData.gender) {
      setError("Please select the advisor's gender.");
      return;
    }

    if (!formData.type) {
      setError("Please select the advisor type.");
      return;
    }

    if (!formData.phone_number.trim()) {
      setError("Phone number is required.");
      return;
    }

    if (!formData.location.trim()) {
      setError("Location is required.");
      return;
    }

    if (!formData.start || !formData.end) {
      setError("Working hours are required.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("adminToken");

      const response = await axios.post(
        `${API_URL}/advisors`,
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          gender: formData.gender,
          type: formData.type,
          phone_number: formData.phone_number.trim(),
          location: formData.location.trim(),
          working_hours: {
            start: formData.start,
            end: formData.end,
          },
          active: formData.active,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      setSuccess(response.data?.message || "Advisor created successfully.");

      setFormData({
        name: "",
        email: "",
        gender: "",
        type: "",
        phone_number: "",
        location: "",
        start: "09:00",
        end: "17:00",
        active: true,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Failed to create advisor.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f5f6] text-[#3e1919]">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
        {/* Header */}
        <header className="mb-10 border-b border-[#a79093]/30 pb-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a79093]">
                SafeLink Administration
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#3e1919] sm:text-4xl">
                Create advisor
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#a79093]">
                Add a trusted advisor to the SafeLink support network and
                configure their availability.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/admin/dashboard")}
              disabled={loading}
              className="w-fit border-b border-[#3e1919] pb-1 text-sm font-semibold text-[#3e1919] transition hover:border-[#a79093] hover:text-[#a79093] disabled:opacity-50"
            >
              Back to dashboard
            </button>
          </div>
        </header>

        {/* Status messages */}
        {error && (
          <div
            role="alert"
            className="mb-8 border-l-4 border-[#3e1919] bg-[#f0e2d6] px-5 py-4"
          >
            <p className="text-sm font-medium text-[#3e1919]">{error}</p>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-8 border-l-4 border-[#a79093] bg-[#f0e2d6] px-5 py-4"
          >
            <p className="text-sm font-medium text-[#3e1919]">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Personal information */}
          <section className="border-y border-[#a79093]/30">
            <div className="grid lg:grid-cols-[220px_1fr]">
              <div className="border-b border-[#a79093]/30 py-6 lg:border-b-0 lg:border-r lg:pr-8">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a79093]">
                  01
                </p>

                <h2 className="mt-2 text-lg font-semibold text-[#3e1919]">
                  Personal information
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#a79093]">
                  Basic information used to identify and contact the advisor.
                </p>
              </div>

              <div className="grid gap-x-8 gap-y-6 py-7 lg:grid-cols-2 lg:pl-8">
                {/* Name */}
                <div>
                  <label
                    htmlFor="advisor-name"
                    className="mb-2 block text-sm font-semibold text-[#3e1919]"
                  >
                    Full name
                  </label>

                  <input
                    id="advisor-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    disabled={loading}
                    className="w-full border-b border-[#a79093]/50 bg-transparent px-0 py-3 text-sm text-[#3e1919] outline-none transition placeholder:text-[#a79093]/70 focus:border-[#3e1919] disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="advisor-email"
                    className="mb-2 block text-sm font-semibold text-[#3e1919]"
                  >
                    Email address
                  </label>

                  <input
                    id="advisor-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="advisor@example.com"
                    disabled={loading}
                    className="w-full border-b border-[#a79093]/50 bg-transparent px-0 py-3 text-sm text-[#3e1919] outline-none transition placeholder:text-[#a79093]/70 focus:border-[#3e1919] disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label
                    htmlFor="advisor-gender"
                    className="mb-2 block text-sm font-semibold text-[#3e1919]"
                  >
                    Gender
                  </label>

                  <select
                    id="advisor-gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full border-b border-[#a79093]/50 bg-transparent px-0 py-3 text-sm text-[#3e1919] outline-none transition focus:border-[#3e1919] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                {/* Advisor type */}
                <div>
                  <label
                    htmlFor="advisor-type"
                    className="mb-2 block text-sm font-semibold text-[#3e1919]"
                  >
                    Advisor type
                  </label>

                  <select
                    id="advisor-type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full border-b border-[#a79093]/50 bg-transparent px-0 py-3 text-sm text-[#3e1919] outline-none transition focus:border-[#3e1919] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select type</option>
                    <option value="medical">Medical</option>
                    <option value="legal">Legal</option>
                    <option value="psychological">Psychological</option>
                    <option value="general">General</option>
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="advisor-phone"
                    className="mb-2 block text-sm font-semibold text-[#3e1919]"
                  >
                    Phone number
                  </label>

                  <input
                    id="advisor-phone"
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    disabled={loading}
                    className="w-full border-b border-[#a79093]/50 bg-transparent px-0 py-3 text-sm text-[#3e1919] outline-none transition placeholder:text-[#a79093]/70 focus:border-[#3e1919] disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                {/* Location */}
                <div>
                  <label
                    htmlFor="advisor-location"
                    className="mb-2 block text-sm font-semibold text-[#3e1919]"
                  >
                    Location
                  </label>

                  <input
                    id="advisor-location"
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter location"
                    disabled={loading}
                    className="w-full border-b border-[#a79093]/50 bg-transparent px-0 py-3 text-sm text-[#3e1919] outline-none transition placeholder:text-[#a79093]/70 focus:border-[#3e1919] disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Working hours */}
          <section className="border-b border-[#a79093]/30">
            <div className="grid lg:grid-cols-[220px_1fr]">
              <div className="border-b border-[#a79093]/30 py-6 lg:border-b-0 lg:border-r lg:pr-8">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a79093]">
                  02
                </p>

                <h2 className="mt-2 text-lg font-semibold text-[#3e1919]">
                  Working hours
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#a79093]">
                  Set the regular hours during which this advisor is available.
                </p>
              </div>

              <div className="grid gap-x-8 gap-y-6 py-7 lg:grid-cols-2 lg:pl-8">
                <div>
                  <label
                    htmlFor="advisor-start"
                    className="mb-2 block text-sm font-semibold text-[#3e1919]"
                  >
                    Start time
                  </label>

                  <input
                    id="advisor-start"
                    type="time"
                    name="start"
                    value={formData.start}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full border-b border-[#a79093]/50 bg-transparent px-0 py-3 text-sm text-[#3e1919] outline-none transition focus:border-[#3e1919] disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="advisor-end"
                    className="mb-2 block text-sm font-semibold text-[#3e1919]"
                  >
                    End time
                  </label>

                  <input
                    id="advisor-end"
                    type="time"
                    name="end"
                    value={formData.end}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full border-b border-[#a79093]/50 bg-transparent px-0 py-3 text-sm text-[#3e1919] outline-none transition focus:border-[#3e1919] disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between border-t border-[#a79093]/20 pt-6">
                    <div>
                      <p className="text-sm font-semibold text-[#3e1919]">
                        Account status
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#a79093]">
                        Allow this advisor to log in immediately after creation.
                      </p>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={formData.active}
                      aria-label="Toggle advisor account status"
                      onClick={() =>
                        setFormData((previous) => ({
                          ...previous,
                          active: !previous.active,
                        }))
                      }
                      disabled={loading}
                      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                        formData.active
                          ? "bg-[#3e1919]"
                          : "bg-[#a79093]/50"
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                          formData.active ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Form actions */}
          <section className="flex flex-col-reverse gap-4 border-b border-[#a79093]/30 py-7 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs leading-5 text-[#a79093]">
                All required advisor information must be completed before
                submission.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/admin/dashboard")}
                disabled={loading}
                className="border border-[#a79093]/50 px-6 py-3 text-sm font-semibold text-[#3e1919] transition hover:bg-[#f0e2d6] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="bg-[#3e1919] px-6 py-3 text-sm font-semibold text-[#f7f5f6] transition hover:bg-[#3e1919]/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating advisor..." : "Create advisor"}
              </button>
            </div>
          </section>
        </form>

        {/* Footer note */}
        <footer className="pt-6">
          <p className="text-xs leading-5 text-[#a79093]">
            SafeLink advisor accounts are managed by authorized administrators.
            Make sure the information provided is accurate before creating the
            account.
          </p>
        </footer>
      </div>
    </main>
  );
}