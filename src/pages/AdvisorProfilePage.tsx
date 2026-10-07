import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
          err instanceof Error
            ? err.message
            : "Could not load profile.",
        ),
      );
  }, [token, navigate]);

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
        working_hours: { start, end },
      });

      setProfile(advisor);
      setProfileMessage("Profile updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not update profile.",
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

      const result = await changePassword(
        token,
        newPassword,
        confirmPassword,
      );

      setPasswordMessage(result.message);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not change password.",
      );
    } finally {
      setSavingPassword(false);
    }
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#3e1919]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0e2d6]">
            <User className="h-7 w-7 text-[#3e1919]" />
          </div>

          <p className="text-sm font-medium text-[#f7f5f6]">
            Loading profile...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#3e1919] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Top navigation */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/advisor/dashboard")}
            className="group flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[#f0e2d6] transition hover:bg-[#f0e2d6] hover:text-[#3e1919]"
          >
            <ArrowLeft
              size={17}
              className="transition-transform group-hover:-translate-x-0.5"
            />
            Back to dashboard
          </button>
        </div>

        {/* Profile Hero */}
        <section className="relative mb-6 overflow-hidden rounded-3xl bg-[#f7f5f6] shadow-2xl">
          <div className="h-28 bg-[#f0e2d6]" />

          <div className="relative px-6 pb-6 sm:px-8">
            {/* Avatar */}
            <div className="-mt-12 mb-4 flex items-end justify-between">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-[#f7f5f6] bg-[#3e1919] shadow-lg">
                <User
                  size={40}
                  strokeWidth={1.6}
                  className="text-[#f0e2d6]"
                />
              </div>

              <div className="mb-1 flex items-center gap-2 rounded-full bg-[#f0e2d6] px-3 py-1.5 text-xs font-semibold text-[#3e1919]">
                <span className="h-2 w-2 rounded-full bg-[#a79093]" />
                Active advisor
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#3e1919] sm:text-3xl">
                {profile.name || "Advisor Profile"}
              </h1>

              <p className="mt-1 text-sm text-[#a79093]">
                Manage your professional information and account
                settings.
              </p>
            </div>

            {/* Profile information */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3 rounded-2xl border border-[#f0e2d6] bg-[#f0e2d6]/50 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#3e1919]">
                  <Mail size={16} className="text-[#f0e2d6]" />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-[#a79093]">
                    Email
                  </p>
                  <p className="truncate text-sm font-medium text-[#3e1919]">
                    {profile.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-[#f0e2d6] bg-[#f0e2d6]/50 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#3e1919]">
                  <BriefcaseBusiness
                    size={16}
                    className="text-[#f0e2d6]"
                  />
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-[#a79093]">
                    Advisor type
                  </p>
                  <p className="text-sm font-medium capitalize text-[#3e1919]">
                    {profile.type}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-[#f0e2d6] bg-[#f0e2d6]/50 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#3e1919]">
                  <Phone size={16} className="text-[#f0e2d6]" />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-[#a79093]">
                    Phone
                  </p>
                  <p className="truncate text-sm font-medium text-[#3e1919]">
                    {profile.phone_number || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-[#f0e2d6] bg-[#f0e2d6]/50 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#3e1919]">
                  <MapPin size={16} className="text-[#f0e2d6]" />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-[#a79093]">
                    Location
                  </p>
                  <p className="truncate text-sm font-medium text-[#3e1919]">
                    {profile.location || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#a79093]/40 bg-[#f0e2d6] px-4 py-3.5 text-sm text-[#3e1919]">
            <ShieldCheck
              size={18}
              className="mt-0.5 shrink-0 text-[#3e1919]"
            />

            <p>{error}</p>
          </div>
        )}

        {/* Main content */}
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          {/* Personal Information */}
          <section className="rounded-3xl bg-[#f7f5f6] p-6 shadow-xl sm:p-8">
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f0e2d6]">
                  <User
                    size={21}
                    className="text-[#3e1919]"
                  />
                </div>

                <h2 className="text-xl font-bold text-[#3e1919]">
                  Personal information
                </h2>

                <p className="mt-1 text-sm text-[#a79093]">
                  Keep your advisor information up to date.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Name */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#3e1919]">
                  Full name
                </label>

                <div className="relative">
                  <User
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a79093]"
                  />

                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-2xl border border-[#a79093]/30 bg-white py-3.5 pl-11 pr-4 text-sm text-[#3e1919] outline-none transition placeholder:text-[#a79093] focus:border-[#3e1919] focus:ring-4 focus:ring-[#f0e2d6]"
                  />
                </div>
              </div>

              {/* Phone + Location */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#3e1919]">
                    Phone number
                  </label>

                  <div className="relative">
                    <Phone
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a79093]"
                    />

                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone number"
                      className="w-full rounded-2xl border border-[#a79093]/30 bg-white py-3.5 pl-11 pr-4 text-sm text-[#3e1919] outline-none transition placeholder:text-[#a79093] focus:border-[#3e1919] focus:ring-4 focus:ring-[#f0e2d6]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#3e1919]">
                    Location
                  </label>

                  <div className="relative">
                    <MapPin
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a79093]"
                    />

                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Your location"
                      className="w-full rounded-2xl border border-[#a79093]/30 bg-white py-3.5 pl-11 pr-4 text-sm text-[#3e1919] outline-none transition placeholder:text-[#a79093] focus:border-[#3e1919] focus:ring-4 focus:ring-[#f0e2d6]"
                    />
                  </div>
                </div>
              </div>

              {/* Working hours */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Clock3
                    size={16}
                    className="text-[#a79093]"
                  />

                  <label className="text-xs font-semibold uppercase tracking-wide text-[#3e1919]">
                    Working hours
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#a79093]/30 bg-white p-3">
                    <label className="mb-2 block text-xs text-[#a79093]">
                      Start time
                    </label>

                    <input
                      type="time"
                      value={start}
                      onChange={(e) => setStart(e.target.value)}
                      className="w-full bg-transparent text-sm font-medium text-[#3e1919] outline-none"
                    />
                  </div>

                  <div className="rounded-2xl border border-[#a79093]/30 bg-white p-3">
                    <label className="mb-2 block text-xs text-[#a79093]">
                      End time
                    </label>

                    <input
                      type="time"
                      value={end}
                      onChange={(e) => setEnd(e.target.value)}
                      className="w-full bg-transparent text-sm font-medium text-[#3e1919] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Success message */}
              {profileMessage && (
                <div className="flex items-center gap-2 rounded-2xl bg-[#f0e2d6] px-4 py-3 text-sm font-medium text-[#3e1919]">
                  <CheckCircle2 size={17} />
                  {profileMessage}
                </div>
              )}

              {/* Save */}
              <button
                type="submit"
                disabled={savingProfile}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#3e1919] py-3.5 text-sm font-semibold text-[#f7f5f6] shadow-md transition hover:bg-[#a79093] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={17} />

                {savingProfile
                  ? "Saving changes..."
                  : "Save profile changes"}
              </button>
            </form>
          </section>

          {/* Security */}
          <section className="h-fit rounded-3xl bg-[#f7f5f6] p-6 shadow-xl sm:p-8">
            <div className="mb-7">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f0e2d6]">
                <LockKeyhole
                  size={21}
                  className="text-[#3e1919]"
                />
              </div>

              <h2 className="text-xl font-bold text-[#3e1919]">
                Account security
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#a79093]">
                Protect your advisor account with a strong password.
              </p>
            </div>

            {/* Security notice */}
            <div className="mb-5 rounded-2xl border border-[#a79093]/20 bg-[#f0e2d6]/60 p-4">
              <div className="flex gap-3">
                <ShieldCheck
                  size={19}
                  className="mt-0.5 shrink-0 text-[#3e1919]"
                />

                <div>
                  <p className="text-sm font-semibold text-[#3e1919]">
                    Keep your account secure
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#a79093]">
                    Use a password that is unique to your SafeLink
                    advisor account.
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleChangePassword}
              className="space-y-4"
            >
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#3e1919]">
                  New password
                </label>

                <div className="relative">
                  <KeyRound
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a79093]"
                  />

                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(e.target.value)
                    }
                    className="w-full rounded-2xl border border-[#a79093]/30 bg-white py-3.5 pl-11 pr-4 text-sm text-[#3e1919] outline-none transition placeholder:text-[#a79093] focus:border-[#3e1919] focus:ring-4 focus:ring-[#f0e2d6]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#3e1919]">
                  Confirm password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a79093]"
                  />

                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    className="w-full rounded-2xl border border-[#a79093]/30 bg-white py-3.5 pl-11 pr-4 text-sm text-[#3e1919] outline-none transition placeholder:text-[#a79093] focus:border-[#3e1919] focus:ring-4 focus:ring-[#f0e2d6]"
                  />
                </div>
              </div>

              {passwordMessage && (
                <div className="flex items-center gap-2 rounded-2xl bg-[#f0e2d6] px-4 py-3 text-sm font-medium text-[#3e1919]">
                  <CheckCircle2 size={17} />
                  <span>{passwordMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={savingPassword}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#3e1919] py-3.5 text-sm font-semibold text-[#f7f5f6] shadow-md transition hover:bg-[#a79093] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LockKeyhole size={17} />

                {savingPassword
                  ? "Updating password..."
                  : "Update password"}
              </button>
            </form>
          </section>
        </div>

        {/* Bottom security note */}
        <div className="flex items-center justify-center gap-2 pb-4 pt-2 text-xs text-[#a79093]">
          <ShieldCheck size={15} />
          <span>Your advisor account is protected by SafeLink</span>
        </div>
      </div>
    </main>
  );
}