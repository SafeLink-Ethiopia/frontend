import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  KeyRound,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";

import { getMyProfile, updateMyProfile } from "../api/advisorPortalApi";

import { changePassword } from "../api/advisorAuthApi";

import type { AdvisorProfile } from "../types/advisorAuth";

export default function AdvisorProfilePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const token = localStorage.getItem("advisor_token") ?? "";

  const [profile, setProfile] = useState<AdvisorProfile | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");

  const [savingProfile, setSavingProfile] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [savingPassword, setSavingPassword] = useState(false);

  const [passwordMessage, setPasswordMessage] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/advisor/login");
      return;
    }

    getMyProfile(token)
      .then(({ advisor }) => {
        setProfile(advisor);
        setName(advisor.name);
        setPhone(advisor.phone_number);
        setLocation(advisor.location);
        setStart(advisor.working_hours.start);
        setEnd(advisor.working_hours.end);
      })
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : t("advisorWorkspace.profileLoadFailed"),
        ),
      );
  }, [token, navigate, t]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSavingProfile(true);
      setProfileMessage("");
      setError("");

      const { advisor } = await updateMyProfile(token, {
        name,
        phone_number: phone,
        location,
        working_hours: {
          start,
          end,
        },
      });

      setProfile(advisor);
      setProfileMessage(t("advisorWorkspace.profileUpdated"));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("advisorWorkspace.profileUpdateFailed"),
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSavingPassword(true);
      setPasswordMessage("");
      setError("");

      const result = await changePassword(token, newPassword, confirmPassword);

      setPasswordMessage(result.message);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("advisorWorkspace.profilePasswordChangeFailed"),
      );
    } finally {
      setSavingPassword(false);
    }
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAFBF7]">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#E7F1E3]">
            <User size={23} className="text-[#176B3A]" />
          </div>

          <p className="text-sm font-medium text-[#173B28]">
            {t("advisorWorkspace.loadingProfile")}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFBF7]">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
        {/* Navigation */}
        <button
          type="button"
          onClick={() => navigate("/advisor/dashboard")}
          className="group mb-10 flex items-center gap-2 text-sm font-medium text-[#176B3A] transition hover:text-[#2F8F4E]"
        >
          <ArrowLeft
            size={17}
            className="transition-transform group-hover:-translate-x-1"
          />
          {t("advisorWorkspace.backToDashboard")}
        </button>

        {/* Header */}
        <header className="border-b border-[#DCE8D9] pb-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight text-[#173B28]">
                    {profile.name || t("advisorWorkspace.advisorProfile")}
                  </h1>

                  <span className="flex items-center gap-1.5 text-xs font-semibold text-[#2F8F4E]">
                    <span className="h-2 w-2 rounded-full bg-[#2F8F4E]" />
                    {t("advisorWorkspace.active")}
                  </span>
                </div>

                <p className="mt-1 text-sm text-[#6B8173]">
                  {t("advisorWorkspace.manageProfileDescription")}
                </p>
              </div>
            </div>
          </div>

          {/* Profile details */}
          <div className="mt-7 flex flex-wrap gap-x-8 gap-y-4">
            <ProfileDetail
              icon={<Mail size={15} />}
              label={t("advisorWorkspace.email")}
              value={profile.email}
            />

            <ProfileDetail
              icon={<BriefcaseBusiness size={15} />}
              label={t("advisorWorkspace.advisorType")}
              value={profile.type}
              capitalize
            />

            <ProfileDetail
              icon={<Phone size={15} />}
              label={t("advisorWorkspace.phone")}
              value={profile.phone_number || t("advisorWorkspace.notProvided")}
            />

            <ProfileDetail
              icon={<MapPin size={15} />}
              label={t("advisorWorkspace.location")}
              value={profile.location || t("advisorWorkspace.notProvided")}
            />
          </div>
        </header>

        {/* Error */}
        {error && (
          <div className="mt-6 flex items-start gap-3 border-l-4 border-red-400 bg-red-50 px-4 py-3 text-sm text-red-700">
            <ShieldCheck size={18} className="mt-0.5 shrink-0" />

            <p>{error}</p>
          </div>
        )}

        {/* Personal information */}
        <section className="border-b border-[#DCE8D9] py-10">
          <div className="mb-7">
            <h2 className="text-xl font-bold text-[#173B28]">
              {t("advisorWorkspace.personalInformation")}
            </h2>

            <p className="mt-1 text-sm text-[#6B8173]">
              {t("advisorWorkspace.keepAdvisorInfoUpdated")}
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="max-w-3xl space-y-6">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#173B28]">
                {t("advisorWorkspace.fullName")}
              </label>

              <div className="relative">
                <User
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7D9585]"
                />

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("advisorWorkspace.enterFullName")}
                  className="w-full rounded-xl border border-[#DCE8D9] bg-white py-3.5 pl-11 pr-4 text-sm text-[#173B28] outline-none transition placeholder:text-[#9AAC9E] focus:border-[#2F8F4E] focus:ring-4 focus:ring-[#E7F1E3]"
                />
              </div>
            </div>

            {/* Phone + Location */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#173B28]">
                  {t("advisorWorkspace.phoneNumber")}
                </label>

                <div className="relative">
                  <Phone
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7D9585]"
                  />

                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t("advisorWorkspace.phoneNumber")}
                    className="w-full rounded-xl border border-[#DCE8D9] bg-white py-3.5 pl-11 pr-4 text-sm text-[#173B28] outline-none transition placeholder:text-[#9AAC9E] focus:border-[#2F8F4E] focus:ring-4 focus:ring-[#E7F1E3]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#173B28]">
                  {t("advisorWorkspace.location")}
                </label>

                <div className="relative">
                  <MapPin
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7D9585]"
                  />

                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={t("advisorWorkspace.yourLocation")}
                    className="w-full rounded-xl border border-[#DCE8D9] bg-white py-3.5 pl-11 pr-4 text-sm text-[#173B28] outline-none transition placeholder:text-[#9AAC9E] focus:border-[#2F8F4E] focus:ring-4 focus:ring-[#E7F1E3]"
                  />
                </div>
              </div>
            </div>

            {/* Working hours */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Clock3 size={16} className="text-[#2F8F4E]" />

                <label className="text-sm font-semibold text-[#173B28]">
                  {t("advisorWorkspace.workingHours")}
                </label>
              </div>

              <div className="grid max-w-xl gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs text-[#7D9585]">
                    {t("advisorWorkspace.startTime")}
                  </label>

                  <input
                    type="time"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className="w-full rounded-xl border border-[#DCE8D9] bg-white px-4 py-3.5 text-sm font-medium text-[#173B28] outline-none transition focus:border-[#2F8F4E] focus:ring-4 focus:ring-[#E7F1E3]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs text-[#7D9585]">
                    {t("advisorWorkspace.endTime")}
                  </label>

                  <input
                    type="time"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    className="w-full rounded-xl border border-[#DCE8D9] bg-white px-4 py-3.5 text-sm font-medium text-[#173B28] outline-none transition focus:border-[#2F8F4E] focus:ring-4 focus:ring-[#E7F1E3]"
                  />
                </div>
              </div>
            </div>

            {/* Success */}
            {profileMessage && (
              <div className="flex items-center gap-2 text-sm font-medium text-[#2F8F4E]">
                <CheckCircle2 size={17} />
                {profileMessage}
              </div>
            )}

            {/* Save */}
            <button
              type="submit"
              disabled={savingProfile}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#176B3A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2F8F4E] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={17} />

              {savingProfile
                ? t("advisorWorkspace.savingChanges")
                : t("advisorWorkspace.saveChanges")}
            </button>
          </form>
        </section>

        {/* Security */}
        <section className="py-10">
          <div className="mb-7">
            <div className="flex items-center gap-3">
              <LockKeyhole size={20} className="text-[#176B3A]" />

              <h2 className="text-xl font-bold text-[#173B28]">
                {t("advisorWorkspace.accountSecurity")}
              </h2>
            </div>

            <p className="mt-1 text-sm text-[#6B8173]">
              {t("advisorWorkspace.updatePasswordDescription")}
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="max-w-3xl space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {/* New password */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#173B28]">
                  {t("advisorWorkspace.profileNewPassword")}
                </label>

                <div className="relative">
                  <KeyRound
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7D9585]"
                  />

                  <input
                    type="password"
                    placeholder={t("advisorWorkspace.profileEnterNewPassword")}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-[#DCE8D9] bg-white py-3.5 pl-11 pr-4 text-sm text-[#173B28] outline-none transition placeholder:text-[#9AAC9E] focus:border-[#2F8F4E] focus:ring-4 focus:ring-[#E7F1E3]"
                  />
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#173B28]">
                  {t("advisorWorkspace.confirmPassword")}
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7D9585]"
                  />

                  <input
                    type="password"
                    placeholder={t("advisorWorkspace.profileConfirmNewPassword")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-[#DCE8D9] bg-white py-3.5 pl-11 pr-4 text-sm text-[#173B28] outline-none transition placeholder:text-[#9AAC9E] focus:border-[#2F8F4E] focus:ring-4 focus:ring-[#E7F1E3]"
                  />
                </div>
              </div>
            </div>

            {/* Password success */}
            {passwordMessage && (
              <div className="flex items-center gap-2 text-sm font-medium text-[#2F8F4E]">
                <CheckCircle2 size={17} />
                {passwordMessage}
              </div>
            )}

            {/* Update */}
            <button
              type="submit"
              disabled={savingPassword}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#176B3A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2F8F4E] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LockKeyhole size={17} />

              {savingPassword
                ? t("advisorWorkspace.updatingPassword")
                : t("advisorWorkspace.updatePassword")}
            </button>
          </form>
        </section>

        {/* Footer */}
        <div className="border-t border-[#DCE8D9] py-6 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-[#7D9585]">
            <ShieldCheck size={14} />
            <span>{t("advisorWorkspace.accountProtected")}</span>
          </div>
        </div>
      </div>
    </main>
  );
}

/*
 * Small profile detail
 */
type ProfileDetailProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  capitalize?: boolean;
};

function ProfileDetail({
  icon,
  label,
  value,
  capitalize = false,
}: ProfileDetailProps) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[#2F8F4E]">{icon}</span>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7D9585]">
          {label}
        </p>

        <p
          className={`text-sm font-medium text-[#173B28] ${
            capitalize ? "capitalize" : ""
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
