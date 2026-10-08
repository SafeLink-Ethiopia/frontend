import { FormEvent, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/*
  Palette (soft leaf green)
  #FAFBF7  mist     - light page background
  #E7F1E3  mint     - soft green cards, highlights
  #2F8F4E  leaf     - accent, borders, light green
  #2F8F4E  green    - primary buttons, logo
  #176B3A  forest   - dark surfaces
  #173B28  ink      - body text
*/

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
    <main className="min-h-screen bg-[#FAFBF7] text-[#173B28]">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
        {/* Header */}
        <header className="mb-10 border-b border-[#E7F1E3] pb-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2F8F4E]">
                SafeLink Administration
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#176B3A] sm:text-4xl">
                Create advisor
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#173B28]/65">
                Add a trusted advisor to the SafeLink support network and
                configure their availability.
              </p>
            </div>

          </div>
          
        </header>

        {/* Status messages */}
        {error && (
          <div
            role="alert"
            className="mb-8 flex items-start justify-between gap-5 rounded-2xl border border-[#2F8F4E]/30 bg-[#E7F1E3] px-5 py-4"
          >
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2F8F4E]">
                Notice
              </p>

              <p className="mt-1 text-sm leading-6 text-[#173B28]">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 text-xl leading-none text-[#2F8F4E] transition hover:text-[#176B3A]"
              aria-label="Close error"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-8 flex items-start justify-between gap-5 rounded-2xl border border-[#2F8F4E]/40 bg-[#E7F1E3] px-5 py-4"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2F8F4E] text-[11px] font-bold text-white">
                ✓
              </span>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2F8F4E]">
                  Success
                </p>

                <p className="mt-1 text-sm leading-6 text-[#173B28]">
                  {success}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="shrink-0 text-xl leading-none text-[#2F8F4E] transition hover:text-[#176B3A]"
              aria-label="Close success message"
            >
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Personal information */}
          <section className="rounded-2xl border border-[#E7F1E3] bg-white">
            <div className="grid lg:grid-cols-[220px_1fr]">
              <div className="border-b border-[#E7F1E3] px-6 py-6 lg:border-b-0 lg:border-r lg:pr-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2F8F4E]">
                  01
                </p>

                <h2 className="mt-2 text-lg font-semibold text-[#176B3A]">
                  Personal information
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#173B28]/65">
                  Basic information used to identify and contact the advisor.
                </p>
              </div>

              <div className="grid gap-x-8 gap-y-6 px-6 py-7 lg:grid-cols-2 lg:pl-8">
                {/* Name */}
                <div>
                  <label
                    htmlFor="advisor-name"
                    className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2F8F4E]"
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
                    className="w-full rounded-xl border border-[#E7F1E3] bg-white px-3 py-2.5 text-sm text-[#173B28] outline-none transition placeholder:text-[#173B28]/40 focus:border-[#2F8F4E] focus:ring-1 focus:ring-[#2F8F4E]/20 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="advisor-email"
                    className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2F8F4E]"
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
                    className="w-full rounded-xl border border-[#E7F1E3] bg-white px-3 py-2.5 text-sm text-[#173B28] outline-none transition placeholder:text-[#173B28]/40 focus:border-[#2F8F4E] focus:ring-1 focus:ring-[#2F8F4E]/20 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label
                    htmlFor="advisor-gender"
                    className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2F8F4E]"
                  >
                    Gender
                  </label>

                  <select
                    id="advisor-gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full rounded-xl border border-[#E7F1E3] bg-white px-3 py-2.5 text-sm text-[#173B28] outline-none transition focus:border-[#2F8F4E] focus:ring-1 focus:ring-[#2F8F4E]/20 disabled:cursor-not-allowed disabled:opacity-50"
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
                    className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2F8F4E]"
                  >
                    Advisor type
                  </label>

                  <select
                    id="advisor-type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full rounded-xl border border-[#E7F1E3] bg-white px-3 py-2.5 text-sm text-[#173B28] outline-none transition focus:border-[#2F8F4E] focus:ring-1 focus:ring-[#2F8F4E]/20 disabled:cursor-not-allowed disabled:opacity-50"
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
                    className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2F8F4E]"
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
                    className="w-full rounded-xl border border-[#E7F1E3] bg-white px-3 py-2.5 text-sm text-[#173B28] outline-none transition placeholder:text-[#173B28]/40 focus:border-[#2F8F4E] focus:ring-1 focus:ring-[#2F8F4E]/20 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                {/* Location */}
                <div>
                  <label
                    htmlFor="advisor-location"
                    className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2F8F4E]"
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
                    className="w-full rounded-xl border border-[#E7F1E3] bg-white px-3 py-2.5 text-sm text-[#173B28] outline-none transition placeholder:text-[#173B28]/40 focus:border-[#2F8F4E] focus:ring-1 focus:ring-[#2F8F4E]/20 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Working hours */}
          <section className="mt-6 rounded-2xl border border-[#E7F1E3] bg-white">
            <div className="grid lg:grid-cols-[220px_1fr]">
              <div className="border-b border-[#E7F1E3] px-6 py-6 lg:border-b-0 lg:border-r lg:pr-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2F8F4E]">
                  02
                </p>

                <h2 className="mt-2 text-lg font-semibold text-[#176B3A]">
                  Working hours
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#173B28]/65">
                  Set the regular hours during which this advisor is available.
                </p>
              </div>

              <div className="grid gap-x-8 gap-y-6 px-6 py-7 lg:grid-cols-2 lg:pl-8">
                <div>
                  <label
                    htmlFor="advisor-start"
                    className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2F8F4E]"
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
                    className="w-full rounded-xl border border-[#E7F1E3] bg-white px-3 py-2.5 text-sm text-[#173B28] outline-none transition focus:border-[#2F8F4E] focus:ring-1 focus:ring-[#2F8F4E]/20 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="advisor-end"
                    className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2F8F4E]"
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
                    className="w-full rounded-xl border border-[#E7F1E3] bg-white px-3 py-2.5 text-sm text-[#173B28] outline-none transition focus:border-[#2F8F4E] focus:ring-1 focus:ring-[#2F8F4E]/20 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between rounded-xl border border-[#E7F1E3] bg-[#FAFBF7] px-4 py-4">
                    <div>
                      <p className="text-sm font-semibold text-[#176B3A]">
                        Account status
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#173B28]/60">
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
                        formData.active ? "bg-[#2F8F4E]" : "bg-[#173B28]/25"
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
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
          <section className="mt-6 flex flex-col-reverse gap-4 rounded-2xl border border-[#E7F1E3] bg-white px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs leading-5 text-[#173B28]/60">
                All required advisor information must be completed before
                submission.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/admin/dashboard")}
                disabled={loading}
                className="rounded-full border border-[#2F8F4E]/40 px-6 py-2.5 text-sm font-medium text-[#176B3A] transition hover:bg-[#E7F1E3] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-[#2F8F4E] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#176B3A] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating advisor..." : "Create advisor"}
              </button>
            </div>
          </section>
        </form>

        {/* Footer note */}
        <footer className="pt-6">
          <p className="text-xs leading-5 text-[#173B28]/55">
            SafeLink advisor accounts are managed by authorized administrators.
            Make sure the information provided is accurate before creating the
            account.
          </p>
        </footer>
      </div>
    </main>
  );
}