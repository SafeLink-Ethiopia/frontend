import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load profile."));
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
      setProfileMessage("Profile updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update profile.");
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
      setError(err instanceof Error ? err.message : "Could not change password.");
    } finally {
      setSavingPassword(false);
    }
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#33484D] text-white">
        <p>Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#33484D] px-5 py-8">
      <div className="mx-auto max-w-lg space-y-6">
        <button onClick={() => navigate("/advisor/dashboard")} className="text-sm text-[#A9C4C9] underline">
          &larr; Back to dashboard
        </button>

        <div className="rounded-3xl bg-[#F4F7F7] p-6 shadow-lg">
          <h1 className="mb-1 text-xl font-semibold text-[#33484D]">My Profile</h1>
          <p className="mb-5 text-sm text-[#6B7A7C]">
            {profile.email} - {profile.type} advisor
          </p>

          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#33484D]">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-[#5C838A]/30 px-3 py-2 text-sm outline-none focus:border-[#5C838A]" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#33484D]">Phone number</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border border-[#5C838A]/30 px-3 py-2 text-sm outline-none focus:border-[#5C838A]" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#33484D]">Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded-xl border border-[#5C838A]/30 px-3 py-2 text-sm outline-none focus:border-[#5C838A]" />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-[#33484D]">Working hours start</label>
                <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="w-full rounded-xl border border-[#5C838A]/30 px-3 py-2 text-sm outline-none focus:border-[#5C838A]" />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-[#33484D]">Working hours end</label>
                <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="w-full rounded-xl border border-[#5C838A]/30 px-3 py-2 text-sm outline-none focus:border-[#5C838A]" />
              </div>
            </div>

            {profileMessage && <p className="text-sm text-[#3D6B72]">{profileMessage}</p>}

            <button type="submit" disabled={savingProfile} className="w-full rounded-xl bg-[#5C838A] py-2.5 text-sm font-semibold text-white hover:bg-[#4C6F75] disabled:opacity-50">
              {savingProfile ? "Saving..." : "Save profile"}
            </button>
          </form>
        </div>

        <div className="rounded-3xl bg-[#F4F7F7] p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-[#33484D]">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-[#5C838A]/30 px-3 py-2 text-sm outline-none focus:border-[#5C838A]"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-[#5C838A]/30 px-3 py-2 text-sm outline-none focus:border-[#5C838A]"
            />
            {passwordMessage && <p className="text-sm text-[#3D6B72]">{passwordMessage}</p>}
            <button type="submit" disabled={savingPassword} className="w-full rounded-xl bg-[#5C838A] py-2.5 text-sm font-semibold text-white hover:bg-[#4C6F75] disabled:opacity-50">
              {savingPassword ? "Updating..." : "Update password"}
            </button>
          </form>
        </div>

        {error && <p className="text-center text-sm text-[#F3B9B9]">{error}</p>}
      </div>
    </main>
  );
}
