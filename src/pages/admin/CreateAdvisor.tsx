
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
import { useTranslation } from "react-i18next";

const API_URL = "http://localhost:5000/api";

type AdvisorType = "medical" | "legal" | "psychological" | "general";
type AdvisorGender = "male" | "female";

export default function CreateAdvisor() {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
      setError(t("admin.createAdvisor.validation.name"));
      return;
    }

    if (!formData.email.trim()) {
      setError(t("admin.createAdvisor.validation.email"));
      return;
    }

    if (!formData.gender) {
      setError(t("admin.createAdvisor.validation.gender"));
      return;
    }

    if (!formData.type) {
      setError(t("admin.createAdvisor.validation.type"));
      return;
    }

    if (!formData.phone_number.trim()) {
      setError(t("admin.createAdvisor.validation.phone"));
      return;
    }

    if (!formData.location.trim()) {
      setError(t("admin.createAdvisor.validation.location"));
      return;
    }

    if (!formData.start || !formData.end) {
      setError(t("admin.createAdvisor.validation.hours"));
      return;
    }

    if (formData.start >= formData.end) {
      setError(t("admin.createAdvisor.validation.timeOrder"));
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
        response.data?.message || t("admin.createAdvisor.success"),
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
          error.response?.data?.message || t("admin.createAdvisor.errors.create"),
        );
      } else {
        setError(t("admin.common.errors.tryAgain"));
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
            {t("admin.createAdvisor.back")}
          </button>

          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2F8F4E]">
              <UserPlus size={15} className="text-white" />
            </div>

            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#176B3A]">
              {t("admin.brand.administration")}
            </span>
          </div>
        </div>

        {/* Header */}
        <header className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#2F8F4E]">
            {t("admin.createAdvisor.eyebrow")}
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-[#173B28] sm:text-4xl">
            {t("admin.createAdvisor.title")}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5C7764]">
            {t("admin.createAdvisor.description")}
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
                    {t("admin.createAdvisor.personalInformation")}
                  </h2>

                  <p className="mt-1 text-sm text-[#5C7764]">
                    {t("admin.createAdvisor.personalDescription")}
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
                  {t("admin.createAdvisor.fields.fullName")}
                  <span className="ml-1 text-[#2F8F4E]">*</span>
                </label>

                <input
                  id="advisor-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t("admin.createAdvisor.placeholders.fullName")}
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
                  {t("admin.createAdvisor.fields.email")}
                  <span className="ml-1 text-[#2F8F4E]">*</span>
                </label>

                <input
                  id="advisor-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t("admin.createAdvisor.placeholders.email")}
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
                  {t("admin.createAdvisor.fields.gender")}
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
                  <option value="">{t("admin.createAdvisor.options.selectGender")}</option>
                  <option value="male">{t("admin.createAdvisor.options.male")}</option>
                  <option value="female">{t("admin.createAdvisor.options.female")}</option>
                </select>
              </div>

              {/* Advisor type */}
              <div>
                <label
                  htmlFor="advisor-type"
                  className={labelClass}
                >
                  {t("admin.createAdvisor.fields.supportArea")}
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
                  <option value="">{t("admin.createAdvisor.options.selectSupportArea")}</option>
                  <option value="medical">{t("admin.createAdvisor.options.medical")}</option>
                  <option value="legal">{t("admin.createAdvisor.options.legal")}</option>
                  <option value="psychological">
                    {t("admin.createAdvisor.options.psychological")}
                  </option>
                  <option value="general">{t("admin.createAdvisor.options.general")}</option>
                </select>
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="advisor-phone"
                  className={labelClass}
                >
                  {t("admin.createAdvisor.fields.phone")}
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
                    placeholder={t("admin.createAdvisor.placeholders.phone")}
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
                  {t("admin.createAdvisor.fields.location")}
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
                    placeholder={t("admin.createAdvisor.placeholders.location")}
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
                    {t("admin.createAdvisor.availability")}
                  </h2>

                  <p className="mt-1 text-sm text-[#5C7764]">
                    {t("admin.createAdvisor.availabilityDescription")}
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
                    {t("admin.createAdvisor.fields.availableFrom")}
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
                    {t("admin.createAdvisor.fields.availableUntil")}
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
                    {t("admin.createAdvisor.fields.accountStatus")}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#5C7764]">
                    {t("admin.createAdvisor.activeDescription")}
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={formData.active}
                  aria-label={t("admin.createAdvisor.toggleAccountStatus")}
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
                  ? t("admin.createAdvisor.activeStatus")
                  : t("admin.createAdvisor.inactiveStatus")}
              </p>
            </div>
          </section>

          {/* Form footer */}
          <div className="flex flex-col-reverse gap-4 border-t border-[#D7E5D9] bg-[#FAFBF7] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <p className="text-xs text-[#719079]">
                <span className="text-[#2F8F4E]">*</span> {t("admin.createAdvisor.requiredFields")}
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/admin/dashboard")}
                disabled={loading}
                className="rounded-lg px-6 py-3 text-sm font-semibold text-[#176B3A] transition hover:bg-[#E7F1E3] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("admin.common.cancel")}
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#2F8F4E] px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#176B3A] focus:outline-none focus:ring-2 focus:ring-[#2F8F4E]/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  t("admin.createAdvisor.creating")
                ) : (
                  <>
                    <UserPlus size={16} />
                    {t("admin.createAdvisor.submit")}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Footer note */}
        <footer className="mt-6 text-center">
          <p className="text-xs leading-5 text-[#719079]">
            {t("admin.createAdvisor.footerNote")}
          </p>
        </footer>
      </div>
    </main>
  );
}
