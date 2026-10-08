
import { FormEvent, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Check,
  Clock3,
  MapPin,
  Phone,
  UserPlus,
} from "lucide-react";
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

    if (formData.start >= formData.end) {
      setError("End time must be later than start time.");
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

      setSuccess(
        response.data?.message || "Advisor created successfully.",
      );

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
        setError(
          error.response?.data?.message || "Failed to create advisor.",
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-[#C9DCCB] bg-[#FAFBF7] px-4 py-3 text-sm text-[#173B28] outline-none transition placeholder:text-[#8AA38F] hover:border-[#9DBFA4] focus:border-[#2F8F4E] focus:ring-2 focus:ring-[#2F8F4E]/10 disabled:cursor-not-allowed disabled:opacity-60";

  const labelClass =
    "mb-2 block text-sm font-semibold text-[#173B28]";

  return (
    <main className="min-h-screen bg-[#FAFBF7] text-[#173B28]">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        {/* Top navigation */}
        <div className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            disabled={loading}
            className="group flex items-center gap-2 text-sm font-medium text-[#176B3A] transition hover:text-[#2F8F4E] disabled:opacity-50"
          >
            <ArrowLeft
              size={17}
              className="transition-transform group-hover:-translate-x-1"
            />
            Back to dashboard
          </button>

          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2F8F4E]">
              <UserPlus size={15} className="text-white" />
            </div>

            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#176B3A]">
              SafeLink Administration
            </span>
          </div>
        </div>

        {/* Header */}
        <header className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#2F8F4E]">
            Advisor management
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-[#173B28] sm:text-4xl">
            Create advisor
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5C7764]">
            Add a trusted professional to the SafeLink support network.
            Complete the information below to create their advisor account.
          </p>
        </header>

        {/* Status messages */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-lg border border-[#C7DCC9] bg-[#E7F1E3] px-4 py-3"
          >
            <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#176B3A]" />

            <p className="text-sm font-medium text-[#173B28]">
              {error}
            </p>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-6 flex items-start gap-3 rounded-lg border border-[#B8D4BC] bg-[#E7F1E3] px-4 py-3"
          >
            <Check
              size={18}
              className="mt-0.5 shrink-0 text-[#2F8F4E]"
            />

            <p className="text-sm font-medium text-[#173B28]">
              {success}
            </p>
          </div>
        )}

        {/* Main form */}
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-[#D7E5D9] bg-white shadow-[0_8px_30px_rgba(23,59,40,0.06)]"
        >
          {/* Personal information section */}
          <section>
            <div className="border-b border-[#D7E5D9] bg-[#E7F1E3]/60 px-5 py-5 sm:px-8">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2F8F4E] text-sm font-bold text-white">
                  01
                </div>

                <div>
                  <h2 className="text-lg font-bold text-[#173B28]">
                    Personal information
                  </h2>

                  <p className="mt-1 text-sm text-[#5C7764]">
                    Provide the advisor's basic contact and professional
                    information.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-x-8 gap-y-6 px-5 py-7 sm:px-8 lg:grid-cols-2">
              {/* Full name */}
              <div>
                <label
                  htmlFor="advisor-name"
                  className={labelClass}
                >
                  Full name
                  <span className="ml-1 text-[#2F8F4E]">*</span>
                </label>

                <input
                  id="advisor-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter advisor's full name"
                  disabled={loading}
                  className={inputClass}
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="advisor-email"
                  className={labelClass}
                >
                  Email address
                  <span className="ml-1 text-[#2F8F4E]">*</span>
                </label>

                <input
                  id="advisor-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="advisor@example.com"
                  disabled={loading}
                  className={inputClass}
                />
              </div>

              {/* Gender */}
              <div>
                <label
                  htmlFor="advisor-gender"
                  className={labelClass}
                >
                  Gender
                  <span className="ml-1 text-[#2F8F4E]">*</span>
                </label>

                <select
                  id="advisor-gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={loading}
                  className={`${inputClass} cursor-pointer`}
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
                  className={labelClass}
                >
                  Area of support
                  <span className="ml-1 text-[#2F8F4E]">*</span>
                </label>

                <select
                  id="advisor-type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  disabled={loading}
                  className={`${inputClass} cursor-pointer`}
                >
                  <option value="">Select area of support</option>
                  <option value="medical">Medical</option>
                  <option value="legal">Legal</option>
                  <option value="psychological">
                    Psychological
                  </option>
                  <option value="general">General</option>
                </select>
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="advisor-phone"
                  className={labelClass}
                >
                  Phone number
                  <span className="ml-1 text-[#2F8F4E]">*</span>
                </label>

                <div className="relative">
                  <Phone
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#719079]"
                  />

                  <input
                    id="advisor-phone"
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    disabled={loading}
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label
                  htmlFor="advisor-location"
                  className={labelClass}
                >
                  Location
                  <span className="ml-1 text-[#2F8F4E]">*</span>
                </label>

                <div className="relative">
                  <MapPin
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#719079]"
                  />

                  <input
                    id="advisor-location"
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Addis Ababa"
                    disabled={loading}
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Availability section */}
          <section className="border-t border-[#D7E5D9]">
            <div className="border-b border-[#D7E5D9] bg-[#E7F1E3]/60 px-5 py-5 sm:px-8">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#176B3A] text-sm font-bold text-white">
                  02
                </div>

                <div>
                  <h2 className="text-lg font-bold text-[#173B28]">
                    Availability
                  </h2>

                  <p className="mt-1 text-sm text-[#5C7764]">
                    Set the advisor's regular working hours and account
                    availability.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-5 py-7 sm:px-8">

              <div className="grid gap-6 sm:grid-cols-2">
                {/* Start */}
                <div>
                  <label
                    htmlFor="advisor-start"
                    className={labelClass}
                  >
                    Available from
                    <span className="ml-1 text-[#2F8F4E]">*</span>
                  </label>

                  <div className="relative">
                    <Clock3
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#719079]"
                    />

                    <input
                      id="advisor-start"
                      type="time"
                      name="start"
                      value={formData.start}
                      onChange={handleChange}
                      disabled={loading}
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </div>

                {/* End */}
                <div>
                  <label
                    htmlFor="advisor-end"
                    className={labelClass}
                  >
                    Available until
                    <span className="ml-1 text-[#2F8F4E]">*</span>
                  </label>

                  <div className="relative">
                    <Clock3
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#719079]"
                    />

                    <input
                      id="advisor-end"
                      type="time"
                      name="end"
                      value={formData.end}
                      onChange={handleChange}
                      disabled={loading}
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="mt-7 flex items-center justify-between gap-6 rounded-xl border border-[#D7E5D9] bg-[#FAFBF7] px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-[#173B28]">
                    Account status
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#5C7764]">
                    Active advisors can sign in and receive support requests
                    immediately after creation.
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
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                    formData.active
                      ? "bg-[#2F8F4E]"
                      : "bg-[#AFC8B3]"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
                      formData.active ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <p className="mt-3 text-xs font-medium text-[#2F8F4E]">
                {formData.active
                  ? "Advisor account will be active."
                  : "Advisor account will be inactive."}
              </p>
            </div>
          </section>

          {/* Form footer */}
          <div className="flex flex-col-reverse gap-4 border-t border-[#D7E5D9] bg-[#FAFBF7] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <p className="text-xs text-[#719079]">
                <span className="text-[#2F8F4E]">*</span> Required fields
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/admin/dashboard")}
                disabled={loading}
                className="rounded-lg px-6 py-3 text-sm font-semibold text-[#176B3A] transition hover:bg-[#E7F1E3] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#2F8F4E] px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#176B3A] focus:outline-none focus:ring-2 focus:ring-[#2F8F4E]/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  "Creating advisor..."
                ) : (
                  <>
                    <UserPlus size={16} />
                    Create advisor
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Footer note */}
        <footer className="mt-6 text-center">
          <p className="text-xs leading-5 text-[#719079]">
            SafeLink advisor accounts are managed by authorized
            administrators. Please verify the information before creating
            the account.
          </p>
        </footer>
      </div>
    </main>
  );
}

